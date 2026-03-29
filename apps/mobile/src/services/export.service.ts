import { Share } from 'react-native';
import RNFS from 'react-native-fs';

import { FileService } from './file.service';
import { ResourceService } from './resource.service';

import type { EntryType } from '@/types';

export type ExportFilters = {
  spaceId?: string;
  spaceIds?: string[];
  childIds?: string[];
  types?: EntryType[];
  dateFrom?: Date;
  dateTo?: Date;
  includeDisputed?: boolean;
  includeResources?: boolean;
};

export type ExportResult = {
  filePath: string;
  fileName: string;
  mimeType: string;
};

const UUID_RADIX = 16;
const UUID_VARIANT_MASK = 0x3;
const UUID_VARIANT_VALUE = 0x8;

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * UUID_RADIX) | 0;
    const v = c === 'x' ? r : (r & UUID_VARIANT_MASK) | UUID_VARIANT_VALUE;

    return v.toString(UUID_RADIX);
  });
}

function getExportDir(): string {
  return RNFS.DocumentDirectoryPath;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDateTime(date: Date): string {
  return date.toLocaleString();
}

export const ExportService = {
  /**
   * Fetch entries with all related data.
   * Supports single-space (spaceId) or multi-space (spaceIds) queries.
   */
  async fetchEntries(_filters: ExportFilters) {
    // TODO: Firebase — implement with Firestore
    return [];
  },

  /**
   * Generate evidence bundle (ZIP-like structure)
   * Creates a folder with JSON data, HTML summary, and attachments
   */
  async generateBundle(filters: ExportFilters): Promise<ExportResult> {
    // TODO: Firebase — implement with Firestore + Firebase Storage
    void FileService;
    void ResourceService;

    const exportDir = getExportDir();
    const timestamp = formatDate(new Date());
    const bundleName = `CoParent_Evidence_${timestamp}`;

    return {
      fileName: bundleName,
      filePath: `${exportDir}/${bundleName}`,
      mimeType: 'application/octet-stream',
    };
  },

  /**
   * Generate a PDF timeline report (HTML).
   * Single-space: cover page with Space name, emoji, and members.
   * All-spaces: cover page listing all Spaces; entries grouped by Space.
   */
  async generatePDF(filters: ExportFilters): Promise<ExportResult> {
    // TODO: Firebase — implement with Firestore
    void ResourceService;
    void RNFS;

    const exportDir = getExportDir();
    const timestamp = formatDate(new Date());
    const fileName = `CoParent_Report_${timestamp}.html`;

    return {
      fileName,
      filePath: `${exportDir}/${fileName}`,
      mimeType: 'text/html',
    };
  },

  getTypeLabel(type: EntryType): string {
    const labels: Record<EntryType, string> = {
      agreement: '🤝 Agreement',
      communication: '💬 Communication',
      event: '📅 Event',
      expense: '💰 Expense',
      upload: '📎 Document',
    };

    return labels[type] || type;
  },

  renderContentHTML(type: EntryType, content: Record<string, unknown>): string {
    switch (type) {
      case 'expense':
        return `
          <p><strong>Amount:</strong> ${content.currency} ${((content.amount as number) / 100).toFixed(2)}</p>
          <p><strong>Category:</strong> ${content.category}</p>
          <p><strong>Split:</strong> ${content.splitType}</p>
          <p>${content.description}</p>
        `;
      case 'event':
        return `
          <p><strong>${content.title}</strong></p>
          <p><strong>When:</strong> ${content.startTime}</p>
          ${content.location ? `<p><strong>Where:</strong> ${content.location}</p>` : ''}
          ${content.notes ? `<p>${content.notes}</p>` : ''}
        `;
      case 'agreement':
        return `
          <p><strong>${content.title}</strong></p>
          <p><strong>Effective:</strong> ${content.effectiveDate}</p>
          ${content.expirationDate ? `<p><strong>Expires:</strong> ${content.expirationDate}</p>` : ''}
          <p>${content.termsText}</p>
        `;
      case 'communication':
        return `
          <p><strong>${content.subject}</strong> ${content.importance === 'high' ? '⚠️' : ''}</p>
          <p>${content.body}</p>
        `;
      case 'upload':
        return `
          <p><strong>${content.title}</strong></p>
          <p><strong>Type:</strong> ${content.documentType}</p>
          ${content.description ? `<p>${content.description}</p>` : ''}
        `;
      default:
        return JSON.stringify(content);
    }
  },

  /**
   * Render a single entry as HTML
   */
  renderEntryHTML(_entry: {
    ackStatus: string | null;
    attachments: { fileHash: string; originalFilename: string }[];
    createdAt: Date;
    type: EntryType;
    version: { contentJson: string };
  }): string {
    // TODO: Firebase — implement with actual entry data
    return '';
  },

  /**
   * Share export file
   */
  async shareExport(result: ExportResult): Promise<void> {
    await Share.share({
      title: result.fileName,
      url: `file://${result.filePath}`,
    });
  },
};

// Suppress unused import warnings
void formatDateTime;
void generateUUID;
