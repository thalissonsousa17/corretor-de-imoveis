// components/ModalFotos.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Foto {
  id?: string;
  url: string;
  isNew?: boolean;
}

interface ModalFotosProps {
  fotos: Foto[];
  onClose: () => void;
  onDeleteFoto: (foto: Foto) => void;
}

const ModalFotos: React.FC<ModalFotosProps> = ({ fotos, onClose, onDeleteFoto }) => {
  return (
    <AnimatePresence>
      <motion.div
        key="modal-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      >
        <motion.div
          key="modal-content"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl p-6 max-w-4xl w-full shadow-xl relative"
        >
          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-700 hover:text-red-600"
          >
            <X size={22} />
          </button>

          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Fotos selecionadas
          </h2>

          {/* Grid de fotos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {fotos.map((foto, i) => (
              <div key={i} className="relative">
                <img
                  src={foto.url}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-40 object-cover rounded-md border"
                />
                <button
                  onClick={() => onDeleteFoto(foto)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalFotos;
