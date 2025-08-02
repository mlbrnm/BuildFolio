"use client";

import { useState, useEffect } from "react";

export default function MarkdownEditor({ id, value, onChange }) {
  const [content, setContent] = useState(value || "");
  const [preview, setPreview] = useState(false);
  const [height, setHeight] = useState("60px");

  useEffect(() => {
    setContent(value || "");
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setContent(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const togglePreview = () => {
    setPreview(!preview);
  };

  const renderMarkdown = (text) => {
    if (!text) return "";

    // Convert markdown to HTML (basic implementation)
    // Headers
    let html = text
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // Bold and italic
    html = html
      .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/gim, "<em>$1</em>");

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/gim,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>'
    );

    // Lists
    html = html.replace(/^\s*\n\*/gim, "<ul>\n*");
    html = html.replace(/^(\*.+)\s*\n([^\*])/gim, "$1\n</ul>\n\n$2");
    html = html.replace(/^\*(.+)/gim, "<li>$1</li>");

    // Numbered lists
    html = html.replace(/^\s*\n\d\./gim, "<ol>\n1.");
    html = html.replace(/^(\d\..+)\s*\n([^\d\.])/gim, "$1\n</ol>\n\n$2");
    html = html.replace(/^\d\.(.+)/gim, "<li>$1</li>");

    // Paragraphs
    html = html.replace(/^\s*\n\s*\n/gim, "</p>\n<p>");

    // Images
    html = html.replace(
      /!\[([^\]]+)\]\(([^)]+)\)/gim,
      '<img src="$2" alt="$1" class="max-w-full h-auto rounded-md my-2" />'
    );

    // Code blocks
    html = html.replace(
      /```([\s\S]*?)```/gim,
      '<pre class="bg-muted p-4 rounded-md overflow-x-auto my-2"><code>$1</code></pre>'
    );

    // Inline code
    html = html.replace(
      /`([^`]+)`/gim,
      '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>'
    );

    // Line breaks
    html = html.replace(/\n/gim, "<br />");

    return `<div class="prose prose-sm max-w-none">${html}</div>`;
  };

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <div className="flex justify-between items-center p-2 bg-card border-b border-border">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {preview ? "Preview" : "Editor"}
        </label>
        <button
          type="button"
          onClick={togglePreview}
          className="text-sm text-primary hover:text-primary/80 cursor-pointer"
        >
          {preview ? "Edit" : "Preview"}
        </button>
      </div>

      {preview ? (
        <div
          className="p-4 bg-background min-h-[60px]"
          style={{ height }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      ) : (
        <textarea
          id={id}
          value={content}
          onChange={handleChange}
          className="w-full p-4 bg-background min-h-[60px] focus:outline-none"
          style={{ height }}
          placeholder="Write your content here using Markdown..."
          onInput={(e) => {
            // Auto-resize the textarea based on content
            const newHeight = Math.max(60, e.target.scrollHeight);
            setHeight(`${newHeight}px`);
          }}
        />
      )}

      {!preview && (
        <div className="p-2 bg-card border-t border-border text-xs text-muted-foreground">
          <p>
            Supports Markdown: <strong>**bold**</strong>, <em>*italic*</em>,{" "}
            <code>`code`</code>, # headers, [links](url), ![images](url), and
            more.
          </p>
        </div>
      )}
    </div>
  );
}
