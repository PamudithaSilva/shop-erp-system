import { ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ title, onClose, children, size = 'md' }: ModalProps) {
  const widths = {
    sm: 'max-w-sm', md: 'max-w-md',
    lg: 'max-w-lg', xl: 'max-w-xl'
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-[0_20px_50px_rgba(24,56,103,0.22)] w-full ${widths[size]} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-primary-dark">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-primary-faint text-slate-400 hover:text-primary">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
