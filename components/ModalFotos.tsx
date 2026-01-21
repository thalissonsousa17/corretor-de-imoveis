import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";

import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Foto {
  id?: string;
  url: string;
  isNew?: boolean;
}

type FotoComId = Foto & { id: string };

interface ModalFotosProps {
  fotos: Foto[];
  imovelId?: string | null;
  onClose: () => void;
  onDeleteFoto: (foto: Foto) => void;
}

type Feedback = {
  type: "success" | "error";
  message: string;
} | null;

function resolveFotoUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("blob:")) return url; // preview local
  if (url.startsWith("http")) return url; // externo
  if (url.startsWith("/uploads/")) return url; // já correto
  return `/uploads/${url}`; // 🔥 FIX
}

function SortableFoto({
  foto,
  index,
  onDeleteFoto,
  onSetPrincipal,
}: {
  foto: Foto;
  index: number;
  onDeleteFoto: (foto: Foto) => void;
  onSetPrincipal: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: foto.id || foto.url,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  const isPrincipal = index === 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative w-full h-36 sm:h-40 rounded-xl overflow-hidden border shadow-sm bg-gray-100 
      ${isDragging ? "ring-2 ring-blue-400 ring-offset-2" : ""}`}
    >
      <img
        src={resolveFotoUrl(foto.url)}
        alt={`Foto ${index + 1}`}
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent" />

      {isPrincipal && (
        <div className="absolute top-2 left-2 bg-emerald-500 text-xs font-semibold px-2 py-1 rounded-full shadow text-white">
          ⭐ Principal
        </div>
      )}

      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[11px] px-2 py-1 rounded-full">
        Foto #{index + 1}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteFoto(foto);
        }}
        className="cursor-pointer absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow"
      >
        <X size={14} />
      </button>

      {!isPrincipal && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSetPrincipal();
          }}
          className="cursor-pointer absolute bottom-2 right-2 bg-white/85 text-[11px] text-gray-800 px-2 py-1 rounded-full hover:bg-white shadow"
        >
          Definir principal
        </button>
      )}
    </div>
  );
}

const ModalFotos: React.FC<ModalFotosProps> = ({ fotos, imovelId, onClose, onDeleteFoto }) => {
  const [lista, setLista] = useState<Foto[]>([...fotos]);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    setLista(fotos);
  }, [fotos]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const salvarOrdem = async (novaLista: Foto[]) => {
    if (!imovelId) return;

    const payload = novaLista
      .filter((foto): foto is FotoComId => typeof foto.id === "string")
      .map((foto, index) => ({
        id: foto.id,
        ordem: index,
      }));

    if (payload.length === 0) return;

    try {
      setIsSaving(true);
      setFeedback(null);

      await axios.put(`/api/imoveis/${imovelId}/ordenar-fotos`, {
        fotos: payload,
      });

      setFeedback({
        type: "success",
        message: "Fotos atualizadas com sucesso!",
      });
    } catch (err) {
      console.error("Erro ao salvar ordem das fotos:", err);
      setFeedback({
        type: "error",
        message: "Erro ao salvar as fotos. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lista.findIndex((f) => (f.id || f.url) === active.id);
    const newIndex = lista.findIndex((f) => (f.id || f.url) === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const novaLista = arrayMove(lista, oldIndex, newIndex);
    setLista(novaLista);
    await salvarOrdem(novaLista);
  };

  const handleSetPrincipal = async (foto: Foto) => {
    const indexAtual = lista.findIndex((f) => (f.id || f.url) === (foto.id || foto.url));
    if (indexAtual <= 0) return;

    const novaLista = arrayMove(lista, indexAtual, 0);
    setLista(novaLista);

    await salvarOrdem(novaLista);
  };

  const handleDeleteLocal = (foto: Foto) => {
    setLista((prev) => prev.filter((f) => (f.id || f.url) !== (foto.id || foto.url)));
    onDeleteFoto(foto);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="modal-bg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 sm:p-6 z-50"
      >
        <motion.div
          key="modal-content"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-[95vw] sm:max-w-3xl md:max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl relative"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
          >
            <X size={22} />
          </button>

          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Gerenciar fotos do imóvel
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Arraste para alterar a ordem ou clique em “Definir principal”.
              </p>
            </div>

            {isSaving && (
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Salvando alterações...
              </div>
            )}
          </div>

          {feedback && (
            <div
              className={`mb-3 sm:mb-4 rounded-lg px-3 py-2 text-xs sm:text-sm flex items-center gap-2 ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <span className="font-medium">
                {feedback.type === "success" ? "Tudo certo!" : "Ops..."}
              </span>
              <span>{feedback.message}</span>
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={lista.map((f) => f.id || f.url)} strategy={rectSortingStrategy}>
              {lista.length > 0 ? (
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
                    {lista.map((foto, i) => (
                      <SortableFoto
                        key={foto.id || foto.url}
                        foto={foto}
                        index={i}
                        onDeleteFoto={handleDeleteLocal}
                        onSetPrincipal={() => handleSetPrincipal(foto)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-gray-300 rounded-xl py-10 text-center text-sm text-gray-500">
                  Nenhuma foto cadastrada para este imóvel.
                </div>
              )}
            </SortableContext>
          </DndContext>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
            <p className="text-xs text-gray-500">
              Dica: a primeira foto da lista é usada como foto principal do imóvel.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 bg-white hover:text-gray-100 hover:bg-gray-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalFotos;
