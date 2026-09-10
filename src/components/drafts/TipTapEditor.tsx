import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import {
  Bold, Italic, UnderlineIcon, List, ListOrdered,
  Heading1, Heading2, AlignLeft, AlignCenter, AlignJustify,
  Undo, Redo,
} from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  content: string;
  onChange?: (html: string) => void;
  readOnly?: boolean;
}

export function TipTapEditor({ content, onChange, readOnly = false }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Bozza dell\'atto…' }),
    ],
    content: content || '<p></p>',
    editable: !readOnly,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[500px] p-0',
        'data-testid': 'tiptap-editor',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== undefined && content !== editor.getHTML()) {
      editor.commands.setContent(content || '<p></p>', { emitUpdate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  if (!editor) return null;

  const btnBase = 'p-1.5 rounded transition-colors';
  const btnIdle = 'text-gray-500 hover:bg-gray-100 hover:text-gray-800';
  const btnActive = 'bg-navy-900 text-white';

  const B = ({
    onClick, active, children, testId,
  }: { onClick: () => void; active?: boolean; children: React.ReactNode; testId?: string }) => (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={clsx(btnBase, active ? btnActive : btnIdle)}
    >
      {children}
    </button>
  );

  const Sep = () => <div className="w-px h-5 bg-gray-200 mx-0.5" />;

  return (
    <div className="flex flex-col h-full">
      {!readOnly && (
        <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-white shrink-0 flex-wrap">
          <B onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} testId="editor-bold">
            <Bold className="w-3.5 h-3.5" />
          </B>
          <B onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} testId="editor-italic">
            <Italic className="w-3.5 h-3.5" />
          </B>
          <B onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} testId="editor-underline">
            <UnderlineIcon className="w-3.5 h-3.5" />
          </B>
          <Sep />
          <B onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} testId="editor-h1">
            <Heading1 className="w-3.5 h-3.5" />
          </B>
          <B onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} testId="editor-h2">
            <Heading2 className="w-3.5 h-3.5" />
          </B>
          <Sep />
          <B onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} testId="editor-ul">
            <List className="w-3.5 h-3.5" />
          </B>
          <B onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} testId="editor-ol">
            <ListOrdered className="w-3.5 h-3.5" />
          </B>
          <Sep />
          <B onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} testId="editor-align-left">
            <AlignLeft className="w-3.5 h-3.5" />
          </B>
          <B onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} testId="editor-align-center">
            <AlignCenter className="w-3.5 h-3.5" />
          </B>
          <B onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} testId="editor-align-justify">
            <AlignJustify className="w-3.5 h-3.5" />
          </B>
          <Sep />
          <B onClick={() => editor.chain().focus().undo().run()} testId="editor-undo">
            <Undo className="w-3.5 h-3.5" />
          </B>
          <B onClick={() => editor.chain().focus().redo().run()} testId="editor-redo">
            <Redo className="w-3.5 h-3.5" />
          </B>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
