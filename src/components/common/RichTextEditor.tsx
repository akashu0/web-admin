"use client";

import React, { useRef, useEffect, useState } from 'react';
import {
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Link2,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Heading1,
    Heading2,
    Type,
} from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
    content,
    onChange,
    placeholder = 'Start typing...',
    minHeight = '150px',
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (editorRef.current && content !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = content;
        }
    }, [content]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
        handleInput();
    };

    const createLink = () => {
        const url = window.prompt('Enter URL:');
        if (url) {
            execCommand('createLink', url);
        }
    };

    const setTextColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        execCommand('foreColor', e.target.value);
    };

    const setBackgroundColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        execCommand('hiliteColor', e.target.value);
    };

    const formatBlock = (tag: string) => {
        execCommand('formatBlock', tag);
    };

    const ToolbarButton = ({
        onClick,
        title,
        children,
    }: {
        onClick: () => void;
        title: string;
        children: React.ReactNode;
    }) => (
        <button
            type="button"
            onClick={onClick}
            className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
            title={title}
            onMouseDown={(e) => e.preventDefault()} // Prevent losing focus
        >
            {children}
        </button>
    );

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300">
                {/* Headings */}
                <ToolbarButton
                    onClick={() => formatBlock('h1')}
                    title="Heading 1"
                >
                    <Heading1 className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => formatBlock('h2')}
                    title="Heading 2"
                >
                    <Heading2 className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => formatBlock('p')}
                    title="Normal Text"
                >
                    <Type className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px bg-gray-300 mx-1" />

                {/* Text Formatting */}
                <ToolbarButton
                    onClick={() => execCommand('bold')}
                    title="Bold (Ctrl+B)"
                >
                    <Bold className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => execCommand('italic')}
                    title="Italic (Ctrl+I)"
                >
                    <Italic className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => execCommand('underline')}
                    title="Underline (Ctrl+U)"
                >
                    <Underline className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px bg-gray-300 mx-1" />

                {/* Lists */}
                <ToolbarButton
                    onClick={() => execCommand('insertUnorderedList')}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => execCommand('insertOrderedList')}
                    title="Numbered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px bg-gray-300 mx-1" />

                {/* Text Alignment */}
                <ToolbarButton
                    onClick={() => execCommand('justifyLeft')}
                    title="Align Left"
                >
                    <AlignLeft className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => execCommand('justifyCenter')}
                    title="Align Center"
                >
                    <AlignCenter className="w-4 h-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => execCommand('justifyRight')}
                    title="Align Right"
                >
                    <AlignRight className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px bg-gray-300 mx-1" />

                {/* Link */}
                <ToolbarButton
                    onClick={createLink}
                    title="Insert Link"
                >
                    <Link2 className="w-4 h-4" />
                </ToolbarButton>

                {/* Color Pickers */}
                <div className="flex items-center gap-2 ml-1">
                    <label className="cursor-pointer" title="Text Color">
                        <input
                            type="color"
                            onChange={setTextColor}
                            className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                            onMouseDown={(e) => e.preventDefault()}
                        />
                    </label>

                    <label className="cursor-pointer" title="Background Color">
                        <input
                            type="color"
                            onChange={setBackgroundColor}
                            className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                            onMouseDown={(e) => e.preventDefault()}
                        />
                    </label>
                </div>
            </div>

            {/* Editor Content */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`p-4 outline-none ${!content && !isFocused ? 'text-gray-400' : ''
                    }`}
                style={{
                    minHeight,
                    maxHeight: '400px',
                    overflowY: 'auto',
                }}
                data-placeholder={placeholder}
                suppressContentEditableWarning
            />

            <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          display: block;
        }

        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
          line-height: 1.2;
        }

        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
          line-height: 1.3;
        }

        [contenteditable] h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.83em 0;
          line-height: 1.4;
        }

        [contenteditable] p {
          margin: 0.5em 0;
          line-height: 1.6;
        }

        [contenteditable] ul,
        [contenteditable] ol {
          padding-left: 2em;
          margin: 0.5em 0;
        }

        [contenteditable] ul {
          list-style-type: disc;
        }

        [contenteditable] ol {
          list-style-type: decimal;
        }

        [contenteditable] li {
          margin: 0.25em 0;
          line-height: 1.6;
        }

        [contenteditable] a {
          color: #7c3aed;
          text-decoration: underline;
          cursor: pointer;
        }

        [contenteditable] a:hover {
          color: #6d28d9;
        }

        [contenteditable] strong {
          font-weight: bold;
        }

        [contenteditable] em {
          font-style: italic;
        }

        [contenteditable] u {
          text-decoration: underline;
        }

        [contenteditable]:focus {
          outline: none;
        }

        /* Scrollbar styling */
        [contenteditable]::-webkit-scrollbar {
          width: 8px;
        }

        [contenteditable]::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        [contenteditable]::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        [contenteditable]::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
        </div>
    );
};