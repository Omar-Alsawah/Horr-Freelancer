import { useState, useEffect, useCallback } from 'react';
import { contractsApi } from '../api/contracts';
import toast from 'react-hot-toast';

/**
 * Query Keys to facilitate future migration to TanStack Query.
 */
export const QUERY_KEYS = {
  CONTRACT: (id) => ['contracts', id],
  DELIVERIES: (contractId) => ['contracts', contractId, 'deliveries'],
};

/**
 * Hook to query contract details.
 * 
 * @param {string|number} id Contract ID
 * @returns {{ data: import('../types/contracts').ContractDto|null, isLoading: boolean, error: any, refetch: () => Promise<void> }}
 */
export function useContractQuery(id) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContract = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await contractsApi.getContract(id);
      setData(res.data?.data || res.data);
    } catch (err) {
      setError(err);
      toast.error(err.title || 'Failed to load contract details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      // Defer execution to avoid calling setState synchronously in effect body
      await Promise.resolve();
      if (active) {
        fetchContract();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchContract]);

  return { data, isLoading, error, refetch: fetchContract };
}

/**
 * Hook to query deliveries associated with a contract.
 * 
 * @param {string|number} contractId Contract ID
 * @returns {{ data: import('../types/contracts').DeliveryDto[], isLoading: boolean, error: any, refetch: () => Promise<void> }}
 */
export function useContractDeliveriesQuery(contractId) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDeliveries = useCallback(async () => {
    if (!contractId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await contractsApi.getDeliveries(contractId);
      setData(res.data?.data || res.data || []);
    } catch (err) {
      setError(err);
      toast.error(err.title || 'Failed to load deliveries history.');
    } finally {
      setIsLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      // Defer execution to avoid calling setState synchronously in effect body
      await Promise.resolve();
      if (active) {
        fetchDeliveries();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchDeliveries]);

  return { data, isLoading, error, refetch: fetchDeliveries };
}

/**
 * Hook to submit work (mutation).
 * 
 * @returns {{ mutate: (payload: import('../types/contracts').DeliverWorkPayload) => Promise<any>, isLoading: boolean, error: any, isSuccess: boolean, reset: () => void }}
 */
export function useDeliverWorkMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutate = useCallback(async (payload) => {
    const { contractId, milestoneId, deliveryNote, attachments, links } = payload;
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    setUploadProgress(0);

    try {
      // 1. Upload files first if any exist
      let uploadedAttachments = [];
      if (attachments && attachments.length > 0) {
        const formData = new FormData();
        attachments.forEach((file) => {
          formData.append('files', file);
        });

        const uploadRes = await contractsApi.uploadFiles(formData, {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          }
        });

        const uploadedFiles = uploadRes.data?.data || uploadRes.data || [];
        uploadedAttachments = uploadedFiles.map(file => ({
          fileUrl: file.fileUrl || file.storagePath,
          fileType: file.fileType || file.name.substring(file.name.lastIndexOf('.')).toLowerCase(),
          originalFileName: file.originalFileName || file.fileName,
          fileSizeBytes: file.fileSizeBytes
        }));
      }

      // Appending links to note text if backend does not directly support it as JSON key
      let formattedNote = deliveryNote?.trim() || '';
      if (links && links.length > 0) {
        const activeLinks = links.filter(l => l?.trim());
        if (activeLinks.length > 0) {
          formattedNote += `\n\nLinks:\n${activeLinks.join('\n')}`;
        }
      }

      // 2. Submit the delivery JSON
      const submitPayload = {
        contractId: Number(contractId),
        contractMilestoneId: milestoneId || undefined,
        deliveryNote: formattedNote,
        attachments: uploadedAttachments
      };

      const res = await contractsApi.submitDelivery(submitPayload);
      setIsSuccess(true);
      toast.success('Work submitted successfully!');
      return res.data;
    } catch (err) {
      setError(err);
      toast.error(err.title || 'Failed to submit work.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
    setUploadProgress(0);
  }, []);

  return { mutate, isLoading, error, isSuccess, uploadProgress, reset };
}

/**
 * Hook to download attachments via authenticated request (mutation/trigger).
 * 
 * @returns {{ mutate: (contractId: string|number, deliveryId: string|number, attachmentId: string|number, filename: string) => Promise<void>, isLoading: boolean, error: any }}
 */
export function useDownloadAttachmentMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (contractId, deliveryId, attachmentId, filename) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await contractsApi.downloadAttachment(attachmentId);
      
      // Trigger file download using window.URL
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || `attachment-${attachmentId}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err);
      toast.error(err.title || 'Failed to download attachment.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { mutate, isLoading, error };
}

