import { X, Loader, Eye } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (args?: any) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  showPreviewButton?: boolean;
  onPreview?: () => void;
}

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isSubmitting,
  showPreviewButton = false,
  onPreview
}: ConfirmationDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-75 bg-gray-500/50 z-52">
      <div className="bg-white rounded-[4px] p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-accent-1">{title}</h3>
          <button onClick={onClose} className="text-accent-1 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="mb-6 text-sm text-secondary">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-medium text-gray-700 rounded-[4px] hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          {showPreviewButton && onPreview && (
            <button
              onClick={() => {
                onPreview();
                onClose();
              }}
              className="px-4 py-2 bg-secondary text-accent-1 rounded-[4px] hover:bg-gray-100 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview First
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 bg-accent-1 text-white rounded-[4px] hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
