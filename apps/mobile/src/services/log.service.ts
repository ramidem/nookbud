/**
 * LogService — structured logging with local buffer + Supabase flush.
 *
 * Logs are buffered in MMKV and flushed to Supabase every FLUSH_INTERVAL_MS
 * or when explicitly flushed. Works offline — queues until connected.
 *
 * Usage:
 *   LogService.info('auth', 'Sign up attempted', { email: '...' });
 *   LogService.error('nav', 'navigationRef not ready', { attempt: 3 });
 */

import { Platform } from 'react-native';
import { createMMKV } from 'react-native-mmkv';

import CONFIG from '@/config';
import { getSupabaseClient } from '@/config/supabase';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export type LogLevel = 'debug' | 'error' | 'info' | 'warn';

interface LogEntry {
  appVersion: string;
  createdAt: string; // ISO
  deviceId: string;
  id: string;
  level: LogLevel;
  message: string;
  metadataJson: string | null;
  tag: string;
  traceId: string | null;
  userId: string | null;
}

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

const APP_VERSION = '0.0.1';
const FLUSH_INTERVAL_MS = 30_000; // 30 seconds
const MAX_BUFFER_SIZE = 200;
const BUFFER_KEY = 'log_buffer';
const DEVICE_ID_KEY = 'log_device_id';
const LOG_STORAGE_ID = 'coparent-logs';

const IS_DEV = __DEV__;

// ------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------

const storage = createMMKV({
  encryptionKey: CONFIG.STORAGE_KEY,
  id: LOG_STORAGE_ID,
});

// ------------------------------------------------------------------
// Device ID (stable per install)
// ------------------------------------------------------------------

function getDeviceId(): string {
  let id = storage.getString(DEVICE_ID_KEY);
  if (!id) {
    const RADIX = 36;
    const SLICE_START = 2;
    const SLICE_END = 9;
    id = `${Platform.OS}-${Date.now()}-${Math.random().toString(RADIX).slice(SLICE_START, SLICE_END)}`;
    storage.set(DEVICE_ID_KEY, id);
  }

  return id;
}

// ------------------------------------------------------------------
// Buffer helpers
// ------------------------------------------------------------------

function readBuffer(): LogEntry[] {
  try {
    const raw = storage.getString(BUFFER_KEY);

    return raw ? (JSON.parse(raw) as LogEntry[]) : [];
  } catch {
    return [];
  }
}

function writeBuffer(entries: LogEntry[]): void {
  storage.set(BUFFER_KEY, JSON.stringify(entries));
}

function generateId(): string {
  const RADIX = 36;
  const ID_START = 2;
  const ID_END = 9;

  return `${Date.now()}-${Math.random().toString(RADIX).slice(ID_START, ID_END)}`;
}

// ------------------------------------------------------------------
// Current user (lazy — avoids circular dep)
// ------------------------------------------------------------------

let currentUserId: string | null = null;

// ------------------------------------------------------------------
// Trace ID — correlate logs across a single logical flow
// ------------------------------------------------------------------

let currentTraceId: string | null = null;

function generateTraceId(): string {
  const RADIX = 36;
  const ID_START = 2;
  const ID_END = 9;

  return `trace-${Date.now()}-${Math.random().toString(RADIX).slice(ID_START, ID_END)}`;
}

// ------------------------------------------------------------------
// Core log function
// ------------------------------------------------------------------

interface LogOptions {
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  tag: string;
}

function log({ level, message, metadata, tag }: LogOptions): void {
  const entry: LogEntry = {
    appVersion: APP_VERSION,
    createdAt: new Date().toISOString(),
    deviceId: getDeviceId(),
    id: generateId(),
    level,
    message,
    metadataJson: metadata ? JSON.stringify(metadata) : null,
    tag,
    traceId: currentTraceId,
    userId: currentUserId,
  };

  // Always print to console in dev
  if (IS_DEV) {
    const traceTag = currentTraceId ? ` [${currentTraceId}]` : '';
    const prefix = `[${level.toUpperCase()}][${tag}]${traceTag}`;
    if (level === 'error') {
      // eslint-disable-next-line no-console
      console.error(prefix, message, metadata ?? '');
    } else if (level === 'warn') {
      // eslint-disable-next-line no-console
      console.warn(prefix, message, metadata ?? '');
    } else {
      // eslint-disable-next-line no-console
      console.log(prefix, message, metadata ?? '');
    }
  }

  // Buffer for Supabase flush
  const buffer = readBuffer();
  buffer.push(entry);

  // Trim if over limit
  if (buffer.length > MAX_BUFFER_SIZE) {
    buffer.splice(0, buffer.length - MAX_BUFFER_SIZE);
  }

  writeBuffer(buffer);
}

// ------------------------------------------------------------------
// Flush to Supabase
// ------------------------------------------------------------------

async function flush(): Promise<void> {
  const buffer = readBuffer();
  if (buffer.length === 0) return;

  const client = getSupabaseClient();
  if (!client) return;

  const rows = buffer.map((e) => ({
    app_version: e.appVersion,
    created_at: e.createdAt,
    device_id: e.deviceId,
    level: e.level,
    message: e.message,
    metadata_json: e.metadataJson,
    tag: e.tag,
    trace_id: e.traceId,
    user_id: e.userId,
  }));

  const { error } = await client.from('app_logs').insert(rows);

  if (!error) {
    // Clear only on success
    writeBuffer([]);
  }
}

// ------------------------------------------------------------------
// Auto-flush timer
// ------------------------------------------------------------------

let flushTimer: ReturnType<typeof setInterval> | null = null;

function startAutoFlush(): void {
  if (flushTimer) return;
  flushTimer = setInterval(() => {
    flush().catch(() => {});
  }, FLUSH_INTERVAL_MS);
}

function stopAutoFlush(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

export const LogService = {
  /**
   * Clear the active trace ID. Call after a logical flow completes.
   */
  clearTrace(): void {
    currentTraceId = null;
  },

  debug(tag: string, message: string, metadata?: Record<string, unknown>): void {
    log({ level: 'debug', message, metadata, tag });
  },

  error(tag: string, message: string, metadata?: Record<string, unknown>): void {
    log({ level: 'error', message, metadata, tag });
  },

  /** Manually flush buffer to Supabase. */
  flush,

  info(tag: string, message: string, metadata?: Record<string, unknown>): void {
    log({ level: 'info', message, metadata, tag });
  },

  /**
   * Set a trace ID manually (e.g. from an incoming request header).
   * All subsequent logs will carry this ID until cleared or replaced.
   */
  setTrace(id: string): void {
    currentTraceId = id;
  },

  /**
   * Set the current user id so logs are attributed correctly.
   */
  setUserId(id: string | null): void {
    currentUserId = id;
  },

  /** Start periodic auto-flush (call on app start). */
  startAutoFlush,

  /**
   * Generate a new trace ID and activate it.
   * Returns the ID so callers can reference or log it.
   *
   * Usage:
   *   const trace = LogService.startTrace();
   *   LogService.info('auth', 'Sign up started'); // carries trace
   *   ...
   *   LogService.clearTrace();
   */
  startTrace(): string {
    currentTraceId = generateTraceId();

    return currentTraceId;
  },

  /** Stop periodic auto-flush (call on app background). */
  stopAutoFlush,

  warn(tag: string, message: string, metadata?: Record<string, unknown>): void {
    log({ level: 'warn', message, metadata, tag });
  },
};
