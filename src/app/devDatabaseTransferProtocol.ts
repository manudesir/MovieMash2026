import type { DatabaseSnapshot } from '../modules/persistence/db';

export const PAGES_APP_URL = 'https://manudesir.github.io/MovieMash2026/';
export const TRANSFER_READY_TYPE = 'MOVIEMASH_DB_TRANSFER_READY_V1';
export const TRANSFER_PAYLOAD_TYPE = 'MOVIEMASH_DB_TRANSFER_PAYLOAD_V1';
export const TRANSFER_IMPORTED_TYPE = 'MOVIEMASH_DB_TRANSFER_IMPORTED_V1';

export type TransferReadyMessage = {
  type: typeof TRANSFER_READY_TYPE;
};

export type TransferPayloadMessage = {
  type: typeof TRANSFER_PAYLOAD_TYPE;
  snapshot: DatabaseSnapshot;
};

export type TransferImportedMessage = {
  type: typeof TRANSFER_IMPORTED_TYPE;
  importedAt: number;
};

export type TransferMessage = TransferReadyMessage | TransferPayloadMessage | TransferImportedMessage;

export function isLocalDevOrigin(origin: string) {
  return /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin);
}

export function isPagesOrigin(origin: string) {
  return origin === new URL(PAGES_APP_URL).origin;
}

export function isTransferMessage(value: unknown): value is TransferMessage {
  if (!value || typeof value !== 'object' || !('type' in value)) {
    return false;
  }

  return (
    value.type === TRANSFER_READY_TYPE ||
    value.type === TRANSFER_PAYLOAD_TYPE ||
    value.type === TRANSFER_IMPORTED_TYPE
  );
}
