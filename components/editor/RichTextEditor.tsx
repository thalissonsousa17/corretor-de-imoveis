"use client";
import React, { useCallback, useRef, useState } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
}

// ─── Botão do toolbar ─────────────────────────────────────────────────────────
const Btn: React.FC<{
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ onClick, active, title, children, className = "" }) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    title={title}
    className={`
      flex items-center justify-center w-8 h-8 rounded text-sm font-medium
      transition-all duration-150 select-none
      ${active
        ? "bg-blue-600 text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }
      ${className}
    `}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-6 bg-gray-200 mx-1" />;

// ─── Modal de imagem ──────────────────────────────────────────────────────────
const ImageModal: React.FC<{
  onInsert: (src: string, alt?: string) => void;
  onClose: () => void;
  title?: string;
}> = ({ onInsert, onClose, title = "Inserir Imagem" }) => {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      onInsert(src, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleUrl = () => {
    if (url.trim()) onInsert(url.trim(), alt || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[95vw] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-4">
          {/* Upload de arquivo */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Fazer upload</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
            >
              📁 Clique para selecionar uma imagem
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* URL */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">URL da imagem</p>
            <input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Texto alternativo (opcional)"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleUrl}
              disabled={!url.trim()}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Inserir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Toolbar ──────────────────────────────────────────────────────────────────
const Toolbar: React.FC<{ editor: Editor }> = ({ editor }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const colorRef = useRef<HTMLInputElement>(null);
  const highlightRef = useRef<HTMLInputElement>(null);

  const insertImage = useCallback(
    (src: string, alt?: string) => {
      editor.chain().focus().setImage({ src, alt: alt ?? "" }).run();
      setShowImageModal(false);
      setShowLogoModal(false);
    },
    [editor]
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t-xl">
        {/* Desfazer / Refazer */}
        <Btn title="Desfazer (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()}>
          ↩
        </Btn>
        <Btn title="Refazer (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()}>
          ↪
        </Btn>
        <Divider />

        {/* Estilos de texto */}
        <Btn title="Negrito (Ctrl+B)" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </Btn>
        <Btn title="Itálico (Ctrl+I)" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </Btn>
        <Btn title="Sublinhado (Ctrl+U)" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span style={{ textDecoration: "underline" }}>U</span>
        </Btn>
        <Btn title="Tachado" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <span style={{ textDecoration: "line-through" }}>S</span>
        </Btn>
        <Divider />

        {/* Títulos */}
        <Btn title="Título 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </Btn>
        <Btn title="Título 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </Btn>
        <Btn title="Título 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </Btn>
        <Btn title="Parágrafo" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}>
          ¶
        </Btn>
        <Divider />

        {/* Listas */}
        <Btn title="Lista com marcadores" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          ☰
        </Btn>
        <Btn title="Lista numerada" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          ≡
        </Btn>
        <Btn title="Citação" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          "
        </Btn>
        <Divider />

        {/* Alinhamento */}
        <Btn title="Alinhar à esquerda" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          ⬛
        </Btn>
        <Btn title="Centralizar" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          ≡
        </Btn>
        <Btn title="Alinhar à direita" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          ▤
        </Btn>
        <Btn title="Justificar" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
          ≣
        </Btn>
        <Divider />

        {/* Cor do texto */}
        <div className="relative" title="Cor do texto">
          <input
            ref={colorRef}
            type="color"
            className="absolute inset-0 opacity-0 w-8 h-8 cursor-pointer"
            defaultValue="#000000"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
          <Btn title="Cor do texto" onClick={() => colorRef.current?.click()}>
            <span className="text-xs">A<span className="block w-full h-1 rounded" style={{ background: "linear-gradient(90deg,red,orange,yellow,green,blue,purple)" }} /></span>
          </Btn>
        </div>

        {/* Destaque */}
        <div className="relative" title="Destacar texto">
          <input
            ref={highlightRef}
            type="color"
            className="absolute inset-0 opacity-0 w-8 h-8 cursor-pointer"
            defaultValue="#FFFF00"
            onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
          />
          <Btn title="Destacar texto" active={editor.isActive("highlight")} onClick={() => highlightRef.current?.click()}>
            🖍
          </Btn>
        </div>
        <Divider />

        {/* Inserir Imagem */}
        <Btn title="Inserir imagem" onClick={() => setShowImageModal(true)}>
          🖼
        </Btn>

        {/* Inserir Logo */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowLogoModal(true);
          }}
          title="Inserir logomarca"
          className="flex items-center gap-1 px-2 h-8 rounded text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
        >
          🏷 Logo
        </button>
        <Divider />

        {/* Limpar formatação */}
        <Btn title="Limpar formatação" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          ✕
        </Btn>

        {/* Linha horizontal */}
        <Btn title="Linha divisória" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          —
        </Btn>
      </div>

      {showImageModal && (
        <ImageModal
          title="Inserir Imagem"
          onInsert={insertImage}
          onClose={() => setShowImageModal(false)}
        />
      )}
      {showLogoModal && (
        <ImageModal
          title="Inserir Logomarca"
          onInsert={insertImage}
          onClose={() => setShowLogoModal(false)}
        />
      )}
    </>
  );
};

// ─── Editor Principal ─────────────────────────────────────────────────────────
const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  editable = true,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      ImageExtension.configure({ inline: false, allowBase64: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {editable && <Toolbar editor={editor} />}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none min-h-[600px] bg-white"
        style={{
          padding: "2.5rem",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "13px",
          lineHeight: "1.8",
          color: "#1a1a1a",
        }}
      />

      {/* Estilos do editor */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: 600px;
        }
        .ProseMirror h1 {
          font-size: 1.5em;
          font-weight: 700;
          text-align: center;
          margin: 0 0 1em;
          color: #1a1a1a;
        }
        .ProseMirror h2 {
          font-size: 1.1em;
          font-weight: 700;
          margin: 1.5em 0 0.5em;
          text-transform: uppercase;
          color: #1a1a1a;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 4px;
        }
        .ProseMirror h3 {
          font-size: 1em;
          font-weight: 600;
          margin: 1em 0 0.4em;
          color: #374151;
        }
        .ProseMirror p {
          margin: 0 0 0.75em;
          text-align: justify;
        }
        .ProseMirror ol {
          padding-left: 1.8em;
          margin: 0.5em 0 1em;
        }
        .ProseMirror ul {
          padding-left: 1.8em;
          margin: 0.5em 0 1em;
          list-style-type: disc;
        }
        .ProseMirror li {
          margin-bottom: 0.3em;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #6366f1;
          padding-left: 1em;
          color: #6b7280;
          margin: 1em 0;
          font-style: italic;
        }
        .ProseMirror hr {
          border: none;
          border-top: 1px solid #d1d5db;
          margin: 1.5em 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 0.5em 0;
        }
        .ProseMirror strong {
          font-weight: 700;
        }
        /* Placeholder */
        .ProseMirror p.is-empty::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          float: left;
          height: 0;
        }

        /* ── Estilos de impressão ── */
        @media print {
          body * { visibility: hidden !important; }
          #print-area, #print-area * { visibility: visible !important; }
          #print-area {
            position: fixed !important;
            top: 0; left: 0;
            width: 100%;
            padding: 0 !important;
          }
          .ProseMirror {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
