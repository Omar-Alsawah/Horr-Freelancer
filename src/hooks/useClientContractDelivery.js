import { useState, useEffect, useCallback } from 'react';
import { contractsService } from '../services/contractsService';

// ---------------------------------------------------------------------------
// Query key constants — exported so components can reference them for cache
// invalidation patterns or logging.
// ---------------------------------------------------------------------------
export const QUERY_KEYS = {
  CONTRACT: 'contract',
  CONTRACT_DELIVERIES: 'contractDeliveries',
};

// ---------------------------------------------------------------------------
// useContractQuery — fetches a single contract by id.
// Re-fetches whenever `id` changes.
// ---------------------------------------------------------------------------
export function useContractQuery(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await contractsService.getContract(id);
      setData(result);
    } catch (err) {
      console.error('[useContractQuery] error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load contract.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ---------------------------------------------------------------------------
// useContractDeliveriesQuery — fetches deliveries for a given contractId.
// Defaults data to [] on empty response or error.
// ---------------------------------------------------------------------------
export function useContractDeliveriesQuery(contractId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!contractId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await contractsService.getDeliveries(contractId);
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('[useContractDeliveriesQuery] error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load deliveries.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ---------------------------------------------------------------------------
// useDownloadAttachmentMutation — triggers a real browser file download.
// Creates a temporary object URL and programmatically clicks an <a> element.
// ---------------------------------------------------------------------------
export function useDownloadAttachmentMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (attachmentId, fileName = 'attachment') => {
    setLoading(true);
    setError(null);
    try {
      const blob = await contractsService.downloadAttachment(attachmentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[useDownloadAttachmentMutation] error:', err);
      setError(err.response?.data?.message || err.message || 'Download failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}
