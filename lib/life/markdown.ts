import { marked } from "marked";

marked.setOptions({
  breaks: true,
  gfm: true,
});

export function renderMarkdownToHtml(markdown: string) {
  return marked.parse(markdown);
}
