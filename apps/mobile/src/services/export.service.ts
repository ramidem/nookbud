import { eq, and, gte, lte, ne, inArray, desc } from 'drizzle-orm';
import { Share } from 'react-native';
import RNFS from 'react-native-fs';

import { FileService } from './file.service';

import { db } from '@/database';
import {
  entries,
  entryVersions,
  attachments,
  acknowledgments,
  type EntryType,
} from '@/database/schema';

export type ExportFilters = {
  relationshipId: string;
  childIds?: string[];
  types?: EntryType[];
  dateFrom?: Date;
  dateTo?: Date;
  includeDisputed?: boolean;
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
   * Fetch entries with all related data
   */
  async fetchEntries(filters: ExportFilters) {
    const conditions = [eq(entries.relationshipId, filters.relationshipId)];
    conditions.push(ne(entries.status, 'soft_deleted'));

    if (filters.types && filters.types.length > 0) {
      conditions.push(inArray(entries.type, filters.types));
    }

    if (filters.dateFrom) {
      conditions.push(gte(entries.createdAt, filters.dateFrom));
    }

    if (filters.dateTo) {
      conditions.push(lte(entries.createdAt, filters.dateTo));
    }

    const entryList = await db
      .select()
      .from(entries)
      .where(and(...conditions))
      .orderBy(desc(entries.createdAt));

    const results = [];

    for (const entry of entryList) {
      // Get current version
      const [version] = await db
        .select()
        .from(entryVersions)
        .where(eq(entryVersions.id, entry.currentVersionId ?? ''));

      if (!version) continue;

      // Get attachments
      const atts = await db
        .select()
        .from(attachments)
        .where(eq(attachments.entryVersionId, version.id));

      // Get acknowledgment
      const [ack] = await db
        .select()
        .from(acknowledgments)
        .where(eq(acknowledgments.entryId, entry.id));

      // Filter disputed if needed
      if (!filters.includeDisputed && ack?.status === 'disputed') {
        continue;
      }

      results.push({
        ackStatus: ack?.status || null,
        attachments: atts,
        createdAt: entry.createdAt,
        createdBy: entry.createdBy,
        id: entry.id,
        status: entry.status,
        type: entry.type as EntryType,
        version,
      });
    }

    return results;
  },

  /**
   * Generate evidence bundle (ZIP-like structure)
   * Creates a folder with JSON data, HTML summary, and attachments
   */
  async generateBundle(filters: ExportFilters): Promise<ExportResult> {
    const exportDir = getExportDir();
    const timestamp = formatDate(new Date());
    const bundleName = `CoParent_Evidence_${timestamp}`;
    const bundleDir = `${exportDir}/${bundleName}`;

    // Create bundle directory
    await RNFS.mkdir(bundleDir);
    await RNFS.mkdir(`${bundleDir}/attachments`);

    // Fetch entries
    const entryList = await this.fetchEntries(filters);

    // Generate data.json
    const dataJson = {
      entries: entryList.map((e) => ({
        acknowledgmentStatus: e.ackStatus,
        attachments: e.attachments.map((a) => ({
          bundlePath: `attachments/${a.fileHash}_${a.originalFilename}`,
          filename: a.originalFilename,
          hash: a.fileHash,
          mimeType: a.mimeType,
          size: a.fileSizeBytes,
        })),
        content: JSON.parse(e.version.contentJson),
        createdAt: e.createdAt.toISOString(),
        createdBy: e.createdBy,
        id: e.id,
        status: e.status,
        type: e.type,
        versionNumber: e.version.versionNumber,
      })),
      entryCount: entryList.length,
      exportDate: new Date().toISOString(),
      exportId: generateUUID(),
      filters: {
        dateFrom: filters.dateFrom?.toISOString(),
        dateTo: filters.dateTo?.toISOString(),
        relationshipId: filters.relationshipId,
        types: filters.types,
      },
    };

    await RNFS.writeFile(`${bundleDir}/data.json`, JSON.stringify(dataJson, null, 2), 'utf8');

    // Copy attachments with hash in filename
    const manifest: Array<{ filename: string; hash: string; verified: boolean }> = [];

    const allAttachments = entryList.flatMap((entry) => entry.attachments);

    for (const att of allAttachments) {
      const sourcePath = FileService.getFullPath(att.storagePath);
      const destFilename = `${att.fileHash}_${att.originalFilename}`;
      const destPath = `${bundleDir}/attachments/${destFilename}`;

      try {
        const exists = await RNFS.exists(sourcePath);
        if (!exists) continue;

        await RNFS.copyFile(sourcePath, destPath);
        const verified = await FileService.verifyIntegrity(att.storagePath, att.fileHash);
        manifest.push({
          filename: destFilename,
          hash: att.fileHash,
          verified,
        });
      } catch {
        // Silent fail — attachment copy is best-effort
      }
    }

    // Generate manifest.json
    const manifestJson = {
      bundleId: generateUUID(),
      files: manifest,
      generatedAt: new Date().toISOString(),
      verificationInstructions: [
        '1. For each file in the attachments folder, compute its SHA-256 hash',
        '2. Compare the computed hash with the hash in this manifest',
        '3. If hashes match, the file has not been modified since upload',
        '4. Use: shasum -a 256 <filename> (macOS/Linux) or Get-FileHash (Windows)',
      ],
    };

    await RNFS.writeFile(
      `${bundleDir}/manifest.json`,
      JSON.stringify(manifestJson, null, 2),
      'utf8',
    );

    // Generate HTML summary
    const pdfResult = await this.generatePDF(filters);
    const htmlContent = await RNFS.readFile(pdfResult.filePath, 'utf8');
    await RNFS.writeFile(`${bundleDir}/summary.html`, htmlContent, 'utf8');

    // Generate README
    const readme = `# CoParent Evidence Bundle

Generated: ${new Date().toLocaleString()}
Bundle ID: ${manifestJson.bundleId}

## Contents

- data.json: Machine-readable export of all entries
- summary.html: Human-readable timeline report
- manifest.json: File integrity verification data
- attachments/: All attached files with SHA-256 hashes

## Verification

Each file in the attachments folder is named with its SHA-256 hash prefix.
To verify integrity:

1. Compute SHA-256 hash of the file
2. Compare with the hash in manifest.json
3. Matching hashes prove the file has not been modified

## Legal Notice

This evidence bundle was exported from CoParent, a court-ready
co-parenting record system. All entries are immutable and timestamped
at time of creation. Edit history is preserved in the application.
`;

    await RNFS.writeFile(`${bundleDir}/README.txt`, readme, 'utf8');

    return {
      fileName: bundleName,
      filePath: bundleDir,
      mimeType: 'application/octet-stream',
    };
  },

  /**
   * Generate a PDF timeline report
   * Note: This creates an HTML file that can be printed/shared as PDF
   * For proper PDF generation, integrate react-native-html-to-pdf
   */
  async generatePDF(filters: ExportFilters): Promise<ExportResult> {
    const exportDir = getExportDir();
    const timestamp = formatDate(new Date());
    const fileName = `CoParent_Report_${timestamp}.html`;
    const filePath = `${exportDir}/${fileName}`;

    // Fetch entries
    const entryList = await this.fetchEntries(filters);

    // Build HTML
    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CoParent Timeline Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; color: #2F2F2F; }
    h1 { color: #2F2F2F; border-bottom: 2px solid #C8BFB6; padding-bottom: 10px; }
    .meta { color: #6E6A66; font-size: 14px; margin-bottom: 20px; }
    .entry { border: 1px solid #C8BFB6; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .entry-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .entry-type { font-weight: 600; color: #2F2F2F; }
    .entry-date { color: #6E6A66; font-size: 14px; }
    .entry-content { margin-top: 12px; }
    .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .status-pending { background: #FBF4E1; color: #D9B86C; }
    .status-acknowledged { background: #E8F3EB; color: #7FAF8E; }
    .status-disputed { background: #F5E5E5; color: #B76E6E; }
    .attachment { background: #F7F3EE; padding: 8px; border-radius: 4px; margin-top: 8px; font-size: 14px; }
    .hash { font-family: monospace; font-size: 12px; color: #6E6A66; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #C8BFB6; font-size: 12px; color: #6E6A66; }
  </style>
</head>
<body>
  <h1>📋 CoParent Timeline Report</h1>
  <div class="meta">
    <p>Generated: ${new Date().toLocaleString()}</p>
    <p>Entries: ${entryList.length}</p>
    ${filters.dateFrom ? `<p>From: ${formatDate(filters.dateFrom)}</p>` : ''}
    ${filters.dateTo ? `<p>To: ${formatDate(filters.dateTo)}</p>` : ''}
  </div>
`;

    for (const entry of entryList) {
      const content = JSON.parse(entry.version.contentJson);
      const statusClass =
        entry.ackStatus === 'acknowledged'
          ? 'status-acknowledged'
          : entry.ackStatus === 'disputed'
            ? 'status-disputed'
            : 'status-pending';

      html += `
  <div class="entry">
    <div class="entry-header">
      <span class="entry-type">${this.getTypeLabel(entry.type)}</span>
      <span class="entry-date">${formatDateTime(entry.createdAt)}</span>
    </div>
    <span class="status ${statusClass}">${entry.ackStatus || 'pending'}</span>
    <div class="entry-content">
      ${this.renderContentHTML(entry.type, content)}
    </div>
`;

      if (entry.attachments.length > 0) {
        html += `<div style="margin-top: 12px;"><strong>Attachments:</strong>`;
        for (const att of entry.attachments) {
          html += `
      <div class="attachment">
        📎 ${att.originalFilename}
        <div class="hash">SHA-256: ${att.fileHash}</div>
      </div>`;
        }
        html += `</div>`;
      }

      html += `</div>`;
    }

    html += `
  <div class="footer">
    <p>This report was generated by CoParent. All entries are timestamped and include cryptographic hashes for file integrity verification.</p>
    <p>Report ID: ${generateUUID()}</p>
  </div>
</body>
</html>`;

    await RNFS.writeFile(filePath, html, 'utf8');

    return {
      fileName,
      filePath,
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
   * Share export file
   */
  async shareExport(result: ExportResult): Promise<void> {
    await Share.share({
      title: result.fileName,
      url: `file://${result.filePath}`,
    });
  },
};
