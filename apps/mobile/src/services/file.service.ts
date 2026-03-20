import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get the app's documents directory for file storage
 */
function getStorageDir(): string {
  return Platform.OS === 'ios'
    ? RNFS.DocumentDirectoryPath
    : RNFS.DocumentDirectoryPath;
}

/**
 * Simple SHA-256 hash implementation using SubtleCrypto
 * Falls back to a basic hash if not available
 */
async function sha256(data: string): Promise<string> {
  // In React Native, we need to use a native module or implement our own
  // For now, using react-native-fs's hash function
  // This will be replaced with a proper crypto implementation
  
  // Temporary: return a hash-like string based on content
  // TODO: Replace with proper SHA-256 from react-native-quick-crypto or similar
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Calculate SHA-256 hash of a file
 */
async function hashFile(filePath: string): Promise<string> {
  // react-native-fs has a built-in hash function
  const hash = await RNFS.hash(filePath, 'sha256');
  return hash;
}

export type SavedFile = {
  storagePath: string;
  fileHash: string;
  fileSize: number;
  mimeType: string;
  originalFilename: string;
};

export const FileService = {
  /**
   * Save a file to app storage and compute its SHA-256 hash
   */
  async saveFile(
    sourceUri: string,
    originalFilename: string,
    mimeType: string
  ): Promise<SavedFile> {
    const storageDir = getStorageDir();
    const attachmentsDir = `${storageDir}/attachments`;

    // Ensure attachments directory exists
    const dirExists = await RNFS.exists(attachmentsDir);
    if (!dirExists) {
      await RNFS.mkdir(attachmentsDir);
    }

    // Generate unique filename
    const ext = originalFilename.split('.').pop() || '';
    const uniqueName = `${generateUUID()}${ext ? `.${ext}` : ''}`;
    const destPath = `${attachmentsDir}/${uniqueName}`;

    // Copy file to app storage
    // Handle different URI formats (file://, content://, ph://)
    let sourcePath = sourceUri;
    if (sourcePath.startsWith('file://')) {
      sourcePath = sourcePath.replace('file://', '');
    }

    await RNFS.copyFile(sourcePath, destPath);

    // Get file stats
    const stats = await RNFS.stat(destPath);
    const fileSize = stats.size;

    // Compute SHA-256 hash
    const fileHash = await hashFile(destPath);

    return {
      storagePath: `attachments/${uniqueName}`,
      fileHash,
      fileSize,
      mimeType,
      originalFilename,
    };
  },

  /**
   * Verify file integrity by comparing current hash with stored hash
   */
  async verifyIntegrity(storagePath: string, expectedHash: string): Promise<boolean> {
    const fullPath = this.getFullPath(storagePath);
    
    const exists = await RNFS.exists(fullPath);
    if (!exists) {
      return false;
    }

    const currentHash = await hashFile(fullPath);
    return currentHash === expectedHash;
  },

  /**
   * Get full filesystem path from storage path
   */
  getFullPath(storagePath: string): string {
    const storageDir = getStorageDir();
    return `${storageDir}/${storagePath}`;
  },

  /**
   * Get file:// URI for display
   */
  getFileUri(storagePath: string): string {
    return `file://${this.getFullPath(storagePath)}`;
  },

  /**
   * Delete a file from storage
   */
  async deleteFile(storagePath: string): Promise<void> {
    const fullPath = this.getFullPath(storagePath);
    const exists = await RNFS.exists(fullPath);
    if (exists) {
      await RNFS.unlink(fullPath);
    }
  },

  /**
   * Check if a file exists
   */
  async exists(storagePath: string): Promise<boolean> {
    const fullPath = this.getFullPath(storagePath);
    return RNFS.exists(fullPath);
  },

  /**
   * Get file size
   */
  async getFileSize(storagePath: string): Promise<number> {
    const fullPath = this.getFullPath(storagePath);
    const stats = await RNFS.stat(fullPath);
    return stats.size;
  },

  /**
   * Read file as base64 (for export)
   */
  async readAsBase64(storagePath: string): Promise<string> {
    const fullPath = this.getFullPath(storagePath);
    return RNFS.readFile(fullPath, 'base64');
  },

  /**
   * Supported MIME types
   */
  SUPPORTED_TYPES: {
    images: ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'],
    documents: ['application/pdf'],
    videos: ['video/mp4', 'video/quicktime', 'video/mov'],
  } as const,

  /**
   * Check if a MIME type is supported
   */
  isSupportedType(mimeType: string): boolean {
    const allSupported = [
      ...this.SUPPORTED_TYPES.images,
      ...this.SUPPORTED_TYPES.documents,
      ...this.SUPPORTED_TYPES.videos,
    ];
    return allSupported.includes(mimeType as typeof allSupported[number]);
  },
};
