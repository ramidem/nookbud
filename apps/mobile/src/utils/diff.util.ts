/**
 * Simple JSON diff utility for tracking changes between entry versions.
 * Returns an object describing what changed.
 */

export type DiffResult = {
  added: Record<string, unknown>;
  removed: Record<string, unknown>;
  changed: Record<string, { from: unknown; to: unknown }>;
};

/**
 * Compute diff between two objects
 */
export function computeDiff(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
): DiffResult {
  const diff: DiffResult = {
    added: {},
    changed: {},
    removed: {},
  };

  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    const oldVal = oldObj[key];
    const newVal = newObj[key];

    if (!(key in oldObj)) {
      // Key was added
      diff.added[key] = newVal;
    } else if (!(key in newObj)) {
      // Key was removed
      diff.removed[key] = oldVal;
    } else if (!deepEqual(oldVal, newVal)) {
      // Key was changed
      diff.changed[key] = { from: oldVal, to: newVal };
    }
  }

  return diff;
}

/**
 * Check if diff has any changes
 */
export function hasDiff(diff: DiffResult): boolean {
  return (
    Object.keys(diff.added).length > 0 ||
    Object.keys(diff.removed).length > 0 ||
    Object.keys(diff.changed).length > 0
  );
}

/**
 * Get human-readable summary of changes
 */
export function getDiffSummary(diff: DiffResult): string[] {
  const summaries: string[] = [];

  for (const key of Object.keys(diff.added)) {
    summaries.push(`Added ${key}`);
  }

  for (const key of Object.keys(diff.removed)) {
    summaries.push(`Removed ${key}`);
  }

  for (const key of Object.keys(diff.changed)) {
    summaries.push(`Changed ${key}`);
  }

  return summaries;
}

/**
 * Simple deep equality check
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (typeof a !== 'object') return a === b;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;

    return a.every((val, i) => deepEqual(val, b[i]));
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);

  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
}
