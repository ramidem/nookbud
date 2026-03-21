/**
 * @deprecated The relationships table has been replaced by spaces + space_members.
 * This file is kept only for backward-compatible type exports until screens migrate (Story 39+).
 */

export type Relationship = {
  id: string;
  parentAId: string;
  parentBId: string | null;
  inviteToken: string | null;
  inviteExpiresAt: Date | null;
  createdAt: Date;
};

export type NewRelationship = Partial<Relationship> & { id: string; parentAId: string };
