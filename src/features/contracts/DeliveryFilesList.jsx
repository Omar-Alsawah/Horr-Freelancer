import { FileText, Link as LinkIcon, Download, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function DeliveryFilesList({ attachments = [], onDownload }) {
  const { t } = useTranslation();

  if (!attachments || attachments.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        {t('contracts.no_deliveries', 'No files or links provided.')}
      </div>
    );
  }

  const handleDownload = (e, file) => {
    e.preventDefault();
    if (onDownload) {
      const fileName = file.name || file.originalFileName || file.fileName || 'Attachment';
      onDownload(file.id, fileName);
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {t('contracts.attachments', 'Attachments')}
      </h4>
      <div className="flex flex-col gap-2">
        {attachments.map((item, idx) => {
          const isFile = item.type !== 'LINK';
          const displayName = item.name || item.originalFileName || item.fileName || 'Attachment';
          const itemUrl = item.url || item.fileUrl || '#';
          
          return (
            <div
              key={item.id || idx}
              className="flex items-center justify-between p-2.5 rounded-lg border border-gray-150 bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {isFile ? (
                  <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                ) : (
                  <LinkIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                )}
                <span className="text-sm font-medium text-gray-700 truncate max-w-[280px] sm:max-w-md">
                  {displayName}
                </span>
              </div>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                {isFile ? (
                  <button
                    onClick={(e) => handleDownload(e, item)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    title={t('common.download', 'Download File')}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                ) : (
                  <a
                    href={itemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors"
                    title={t('common.open', 'Open Link')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
