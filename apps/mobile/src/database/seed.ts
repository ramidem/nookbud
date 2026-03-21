/* eslint-disable sort-keys, sort-keys-fix/sort-keys-fix */
/**
 * Development seed data for CoParent.
 * Call seedDatabase() from dev settings to populate the app with realistic data.
 * Safe to run multiple times — clears existing data first.
 *
 * eslint sort-keys disabled: seed data is intentionally ordered for readability.
 */

import { count } from 'drizzle-orm';

import { db } from './client';
import {
  users,
  spaces,
  spaceMembers,
  children,
  entries,
  entryVersions,
  resources,
  acknowledgments,
  auditLogs,
} from './schema';

const HOURS_PER_DAY = 24;
const MINS_PER_HOUR = 60;
const SECS_PER_MIN = 60;
const MS_PER_SEC = 1000;
const MS_PER_DAY = HOURS_PER_DAY * MINS_PER_HOUR * SECS_PER_MIN * MS_PER_SEC;
const daysAgo = (n: number) => new Date(Date.now() - n * MS_PER_DAY);

// Named day offsets for seed data
const D1 = 1;
const D2 = 2;
const D3 = 3;
const D4 = 4;
const D5 = 5;
const D6 = 6;
const D7 = 7;
const D8 = 8;
const D12 = 12;
const D15 = 15;
const D19 = 19;
const D20 = 20;
const D21 = 21;
const D29 = 29;
const D30 = 30;
const D45 = 45;
const D55 = 55;
const D60 = 60;
const D85 = 85;
const D88 = 88;
const D90 = 90;

// Named file sizes and amounts
const FELIX_REPORT_BYTES = 184_320;
const VACC_RECORD_BYTES = 245_760;
const COURT_ORDER_BYTES = 512_000;
const PHILHEALTH_BYTES = 98_304;
const EXPENSE_CHECKUP = 1_250;
const EXPENSE_SCHOOL = 3_800;
const EXPENSE_GROCERIES = 650;

const TZ_MANILA = 'Asia/Manila';
const CURRENCY_PHP = 'PHP';
const MIME_PDF = 'application/pdf';
const ENTRY_TYPE_EXPENSE = 'expense' as const;
const ENTRY_TYPE_EVENT = 'event' as const;
const ENTRY_TYPE_AGREEMENT = 'agreement' as const;
const ENTRY_TYPE_COMMUNICATION = 'communication' as const;
const ENTRY_TYPE_UPLOAD = 'upload' as const;

const USER_MED = 'user-med-001';
const USER_MARIA = 'user-maria-002';
const USER_LOLA = 'user-lola-003';

const SPACE_FELIX = 'space-felix-001';
const SPACE_SOFIA = 'space-sofia-002';

const CHILD_FELIX = 'child-felix-001';
const CHILD_SOFIA = 'child-sofia-002';

export const SEED_USER_ID = USER_MED;
export const SEED_SPACE_IDS = { felix: SPACE_FELIX, sofia: SPACE_SOFIA };

export async function seedDatabase(): Promise<{
  success: boolean;
  skipped?: boolean;
  error?: string;
}> {
  try {
    // Guard: only seed on an empty database
    const [existingUsers] = await db.select({ count: count() }).from(users);
    if (existingUsers.count > 0) {
      return { success: true, skipped: true };
    }

    // ── Users ──────────────────────────────────────────────────────────────
    await db.insert(users).values([
      {
        id: USER_MED,
        displayName: 'Med',
        email: 'med@example.com',
        timezone: TZ_MANILA,
        defaultCurrency: CURRENCY_PHP,
        createdAt: daysAgo(D90), // eslint-disable-line no-magic-numbers
      },
      {
        id: USER_MARIA,
        displayName: 'Maria Santos',
        email: 'maria@example.com',
        timezone: TZ_MANILA,
        defaultCurrency: CURRENCY_PHP,
        createdAt: daysAgo(D88), // eslint-disable-line no-magic-numbers
      },
      {
        id: USER_LOLA,
        displayName: 'Lola Caring',
        email: 'lola@example.com',
        timezone: TZ_MANILA,
        defaultCurrency: CURRENCY_PHP,
        createdAt: daysAgo(D60), // eslint-disable-line no-magic-numbers
      },
    ]);

    // ── Spaces ─────────────────────────────────────────────────────────────
    await db.insert(spaces).values([
      {
        id: SPACE_FELIX,
        name: "Felix's Care",
        emoji: '🦊',
        color: '#6F8F7B',
        createdBy: USER_MED,
        createdAt: daysAgo(D88), // eslint-disable-line no-magic-numbers
        updatedAt: daysAgo(D1),
      },
      {
        id: SPACE_SOFIA,
        name: "Sofia's Care",
        emoji: '🌸',
        color: '#C97C5D',
        createdBy: USER_MED,
        createdAt: daysAgo(D60), // eslint-disable-line no-magic-numbers
        updatedAt: daysAgo(D3),
      },
    ]);

    // ── Space Members ──────────────────────────────────────────────────────
    await db.insert(spaceMembers).values([
      {
        id: 'member-med-felix',
        spaceId: SPACE_FELIX,
        userId: USER_MED,
        role: 'owner',
        label: 'co-parent',
        joinedAt: daysAgo(D88), // eslint-disable-line no-magic-numbers
      },
      {
        id: 'member-maria-felix',
        spaceId: SPACE_FELIX,
        userId: USER_MARIA,
        role: 'editor',
        label: 'co-parent',
        invitedBy: USER_MED,
        joinedAt: daysAgo(D85), // eslint-disable-line no-magic-numbers
      },
      {
        id: 'member-med-sofia',
        spaceId: SPACE_SOFIA,
        userId: USER_MED,
        role: 'owner',
        label: 'guardian',
        joinedAt: daysAgo(D60), // eslint-disable-line no-magic-numbers
      },
      {
        id: 'member-lola-sofia',
        spaceId: SPACE_SOFIA,
        userId: USER_LOLA,
        role: 'editor',
        label: 'grandparent',
        invitedBy: USER_MED,
        joinedAt: daysAgo(D55), // eslint-disable-line no-magic-numbers
      },
    ]);

    // ── Children ───────────────────────────────────────────────────────────
    await db.insert(children).values([
      {
        id: CHILD_FELIX,
        spaceId: SPACE_FELIX,
        name: 'Felix',
        dateOfBirth: new Date('2018-04-12'),
        createdAt: daysAgo(D88), // eslint-disable-line no-magic-numbers
      },
      {
        id: CHILD_SOFIA,
        spaceId: SPACE_SOFIA,
        name: 'Sofia',
        dateOfBirth: new Date('2020-09-03'),
        createdAt: daysAgo(D60), // eslint-disable-line no-magic-numbers
      },
    ]);

    // ── Entries ────────────────────────────────────────────────────────────
    type SeedEntry = {
      id: string;
      spaceId: string;
      childId: string;
      type: ENTRY_TYPE_EXPENSE | 'event' | 'agreement' | 'communication' | 'upload';
      createdAt: Date;
      content: object;
    };

    const E_EXP_001 = 'entry-exp-001';
    const E_EXP_002 = 'entry-exp-002';
    const E_EXP_003 = 'entry-exp-003';
    const E_EVT_001 = 'entry-evt-001';
    const E_EVT_002 = 'entry-evt-002';
    const E_AGR_001 = 'entry-agr-001';
    const E_COM_001 = 'entry-com-001';
    const E_COM_002 = 'entry-com-002';
    const E_UPL_001 = 'entry-upl-001';

    const seedEntries: SeedEntry[] = [
      {
        id: E_EXP_001,
        spaceId: SPACE_FELIX,
        childId: CHILD_FELIX,
        type: ENTRY_TYPE_EXPENSE,
        createdAt: daysAgo(D5),
        content: {
          amount: EXPENSE_CHECKUP,
          currency: CURRENCY_PHP,
          category: 'medical',
          description: 'Pediatric checkup — Dr. Reyes Clinic',
          receiptUri: null,
        },
      },
      {
        id: E_EXP_002,
        spaceId: SPACE_FELIX,
        childId: CHILD_FELIX,
        type: ENTRY_TYPE_EXPENSE,
        createdAt: daysAgo(D12), // eslint-disable-line no-magic-numbers
        content: {
          amount: EXPENSE_SCHOOL,
          currency: CURRENCY_PHP,
          category: 'school',
          description: 'School supplies — 1st quarter',
          receiptUri: null,
        },
      },
      {
        id: E_EXP_003,
        spaceId: SPACE_SOFIA,
        childId: CHILD_SOFIA,
        type: ENTRY_TYPE_EXPENSE,
        createdAt: daysAgo(D3),
        content: {
          amount: EXPENSE_GROCERIES,
          currency: CURRENCY_PHP,
          category: 'food',
          description: 'Weekly groceries for Sofia',
          receiptUri: null,
        },
      },
      {
        id: E_EVT_001,
        spaceId: SPACE_FELIX,
        childId: CHILD_FELIX,
        type: ENTRY_TYPE_EVENT,
        createdAt: daysAgo(D7),
        content: {
          title: "Felix's school play",
          startDate: daysAgo(D7).toISOString(),
          endDate: null,
          location: 'St. Mary School Auditorium',
          notes: 'Felix played the lead role. Maria attended.',
        },
      },
      {
        id: E_EVT_002,
        spaceId: SPACE_FELIX,
        childId: CHILD_FELIX,
        type: ENTRY_TYPE_EVENT,
        createdAt: daysAgo(D20), // eslint-disable-line no-magic-numbers
        content: {
          title: 'Weekend custody — Med',
          startDate: daysAgo(D21).toISOString(), // eslint-disable-line no-magic-numbers
          endDate: daysAgo(D19).toISOString(), // eslint-disable-line no-magic-numbers
          location: null,
          notes: 'Regular weekend. Picked up Friday 6pm, dropped Sunday 6pm.',
        },
      },
      {
        id: E_AGR_001,
        spaceId: SPACE_FELIX,
        childId: CHILD_FELIX,
        type: ENTRY_TYPE_AGREEMENT,
        createdAt: daysAgo(D30), // eslint-disable-line no-magic-numbers
        content: {
          title: 'School pickup schedule',
          text: 'Med picks up Felix on Monday and Wednesday. Maria picks up Tuesday, Thursday, Friday. Alternating weekends.',
          effectiveDate: daysAgo(D30).toISOString(), // eslint-disable-line no-magic-numbers
          expiryDate: null,
        },
      },
      {
        id: E_COM_001,
        spaceId: SPACE_FELIX,
        childId: CHILD_FELIX,
        type: ENTRY_TYPE_COMMUNICATION,
        createdAt: daysAgo(D2),
        content: {
          channel: 'message',
          direction: 'sent',
          summary:
            'Discussed Felix having a fever last night. Agreed to monitor and skip school if still unwell.',
          attachmentUri: null,
        },
      },
      {
        id: E_COM_002,
        spaceId: SPACE_SOFIA,
        childId: CHILD_SOFIA,
        type: ENTRY_TYPE_COMMUNICATION,
        createdAt: daysAgo(D8),
        content: {
          channel: 'call',
          direction: 'received',
          summary:
            "Lola called re: Sofia's allergy flare-up. Advised antihistamine as per prescription.",
          attachmentUri: null,
        },
      },
      {
        id: E_UPL_001,
        spaceId: SPACE_FELIX,
        childId: CHILD_FELIX,
        type: ENTRY_TYPE_UPLOAD,
        createdAt: daysAgo(D15), // eslint-disable-line no-magic-numbers
        content: {
          filename: 'felix-report-card-q1.pdf',
          mimeType: MIME_PDF,
          fileSizeBytes: FELIX_REPORT_BYTES, // eslint-disable-line no-magic-numbers
          description: 'Q1 report card — all subjects passing',
          fileUri: null,
          fileHash: 'sha256-placeholder-abc123',
        },
      },
    ];

    for (const e of seedEntries) {
      const versionId = `${e.id}-v1`;
      await db.insert(entries).values({
        id: e.id,
        spaceId: e.spaceId,
        childId: e.childId,
        type: e.type,
        status: 'active',
        createdBy: USER_MED,
        currentVersionId: versionId,
        createdAt: e.createdAt,
      });
      await db.insert(entryVersions).values({
        id: versionId,
        entryId: e.id,
        contentJson: JSON.stringify(e.content),
        versionNumber: 1,
        createdBy: USER_MED,
        createdAt: e.createdAt,
      });
    }

    // ── Acknowledgments ────────────────────────────────────────────────────
    await db.insert(acknowledgments).values([
      {
        id: 'ack-001',
        entryId: E_EXP_001,
        actedBy: USER_MARIA,
        status: 'acknowledged',
        comment: 'Confirmed. I transferred my share.',
        createdAt: daysAgo(D4),
      },
      {
        id: 'ack-002',
        entryId: E_EVT_001,
        actedBy: USER_MARIA,
        status: 'acknowledged',
        comment: null,
        createdAt: daysAgo(D6),
      },
      {
        id: 'ack-003',
        entryId: E_AGR_001,
        actedBy: USER_MARIA,
        status: 'acknowledged',
        comment: 'Agreed.',
        createdAt: daysAgo(D29), // eslint-disable-line no-magic-numbers
      },
    ]);

    // ── Resources ──────────────────────────────────────────────────────────
    await db.insert(resources).values([
      {
        id: 'resource-001',
        spaceId: SPACE_FELIX,
        childId: CHILD_FELIX,
        title: "Felix's Vaccination Record",
        description: 'Complete immunization history from birth to age 6',
        category: 'medical',
        fileHash: 'sha256-vacc-record-placeholder',
        storagePath: 'resources/felix-vaccination.pdf',
        originalFilename: 'felix-vaccination-record.pdf',
        fileSizeBytes: VACC_RECORD_BYTES, // eslint-disable-line no-magic-numbers
        mimeType: MIME_PDF,
        uploadedBy: USER_MED,
        createdAt: daysAgo(D45), // eslint-disable-line no-magic-numbers
      },
      {
        id: 'resource-002',
        spaceId: SPACE_FELIX,
        childId: CHILD_FELIX,
        title: 'Court Order — Custody Arrangement',
        description: 'Signed court order dated Jan 2024 specifying custody schedule',
        category: 'legal',
        fileHash: 'sha256-court-order-placeholder',
        storagePath: 'resources/custody-order-jan2024.pdf',
        originalFilename: 'custody-order-jan-2024.pdf',
        fileSizeBytes: COURT_ORDER_BYTES, // eslint-disable-line no-magic-numbers
        mimeType: MIME_PDF,
        uploadedBy: USER_MED,
        createdAt: daysAgo(D60), // eslint-disable-line no-magic-numbers
      },
      {
        id: 'resource-003',
        spaceId: SPACE_SOFIA,
        childId: CHILD_SOFIA,
        title: "Sofia's PhilHealth Card",
        description: 'Active PhilHealth membership card',
        category: 'insurance',
        fileHash: 'sha256-philhealth-placeholder',
        storagePath: 'resources/sofia-philhealth.jpg',
        originalFilename: 'sofia-philhealth-card.jpg',
        fileSizeBytes: PHILHEALTH_BYTES, // eslint-disable-line no-magic-numbers
        mimeType: 'image/jpeg',
        uploadedBy: USER_LOLA,
        createdAt: daysAgo(D30), // eslint-disable-line no-magic-numbers
      },
    ]);

    // ── Audit Logs ─────────────────────────────────────────────────────────
    await db.insert(auditLogs).values([
      {
        id: 'audit-001',
        userId: USER_MED,
        action: 'create',
        entityType: 'entry',
        entityId: E_EXP_001,
        metadataJson: JSON.stringify({ type: ENTRY_TYPE_EXPENSE, amount: EXPENSE_CHECKUP }), // eslint-disable-line no-magic-numbers
        createdAt: daysAgo(D5),
      },
      {
        id: 'audit-002',
        userId: USER_MARIA,
        action: 'acknowledge',
        entityType: 'entry',
        entityId: E_EXP_001,
        metadataJson: JSON.stringify({ note: 'Confirmed. I transferred my share.' }),
        createdAt: daysAgo(D4),
      },
    ]);

    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      success: false,
    };
  }
}
