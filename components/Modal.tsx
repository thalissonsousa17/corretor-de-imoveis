import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0  bg-black/50" onClick={onClose} />

      <div className="relative bg-white w-full max-w-5xl mx-4 rounded-2xl shadow-xl p-6">
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X size={22} />
        </button>

        {title && <h2 className="text-2xl font-bold text-[#1A2A4F] mb-4">{title}</h2>}

        {children}
      </div>
    </div>
  );
}
