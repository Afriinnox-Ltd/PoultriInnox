import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
    error?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder,
    className,
    error
}) => {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean'],
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link'
    ];

    return (
        <div className={cn(
            "rich-text-editor-container",
            error ? "border-red-500 rounded-md border" : "",
            className
        )}>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="bg-background rounded-md"
            />
            <style>{`
                .rich-text-editor-container .ql-toolbar.ql-snow {
                    border-top-left-radius: 0.375rem;
                    border-top-right-radius: 0.375rem;
                    border-color: #e5e7eb;
                    background-color: #f9fafb;
                }
                .rich-text-editor-container .ql-container.ql-snow {
                    border-bottom-left-radius: 0.375rem;
                    border-bottom-right-radius: 0.375rem;
                    border-color: #e5e7eb;
                    min-height: 200px;
                    font-size: 0.875rem;
                }
                .rich-text-editor-container .ql-editor {
                    min-height: 200px;
                }
                .rich-text-editor-container .ql-editor.ql-blank::before {
                    color: #9ca3af;
                    font-style: normal;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
