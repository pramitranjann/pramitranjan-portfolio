"use client";

import { marked } from 'marked'

export function MarkdownCard({ content }: { content: string }) {
  return (
    <div
      className="markdown-body"
      dangerouslySetInnerHTML={{ __html: marked.parse(content, { breaks: true, gfm: true }) }}
    />
  );
}
