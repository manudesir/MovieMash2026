import { useEffect } from 'react';
import {
  TRANSFER_IMPORTED_TYPE,
  TRANSFER_PAYLOAD_TYPE,
  TRANSFER_READY_TYPE,
  isLocalDevOrigin,
  isPagesOrigin,
  isTransferMessage,
} from './devDatabaseTransferProtocol';
import { importDatabaseSnapshot } from '../modules/persistence/rankingRepository';

export function useProductionDatabaseImport() {
  // The Pages app accepts DB snapshots only from a local dev origin.
  useEffect(() => {
    if (!isPagesOrigin(window.location.origin)) {
      return;
    }

    function notifyReady() {
      if (window.opener) {
        window.opener.postMessage({ type: TRANSFER_READY_TYPE }, '*');
      }
    }

    async function handleMessage(event: MessageEvent) {
      if (!isLocalDevOrigin(event.origin) || !isTransferMessage(event.data)) {
        return;
      }

      if (event.data.type !== TRANSFER_PAYLOAD_TYPE) {
        return;
      }

      await importDatabaseSnapshot(event.data.snapshot);
      event.source?.postMessage(
        { type: TRANSFER_IMPORTED_TYPE, importedAt: Date.now() },
        { targetOrigin: event.origin },
      );
      window.location.hash = '#/ranking';
      window.location.reload();
    }

    window.addEventListener('message', handleMessage);
    window.setTimeout(notifyReady, 0);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
}
