import * as React from "react";
import { cn } from "../cn";

export interface MarkdownViewProps {
  source: string;
  className?: string;
}

/**
 * Lightweight Markdown renderer. We intentionally avoid pulling a Markdown
 * dependency into the framework — utilities that need full GFM support should
 * bring their own (e.g. `react-markdown`). This brick handles the common case
 * for note previews: paragraphs, headings, fenced code, lists.
 */
export function MarkdownView({ source, className }: MarkdownViewProps) {
  const blocks = React.useMemo(() => parseBlocks(source ?? ""), [source]);
  return (
    <div className={cn("grid gap-2 text-sm leading-relaxed text-reflex-fg-soft", className)}>
      {blocks.map((block, idx) => renderBlock(block, idx))}
    </div>
  );
}

type Block =
  | { kind: "h"; level: number; text: string }
  | { kind: "p"; text: string }
  | { kind: "code"; lang?: string; text: string }
  | { kind: "ul"; items: string[] };

function parseBlocks(source: string): Block[] {
  const lines = source.split(/\r?\n/);
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      i += 1;
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      out.push({ kind: "h", level: heading[1]!.length, text: heading[2]! });
      i += 1;
      continue;
    }
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim() || undefined;
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? "").startsWith("```")) {
        buf.push(lines[i] ?? "");
        i += 1;
      }
      i += 1; // skip closing ```
      const block: Block = { kind: "code", text: buf.join("\n") };
      if (lang) block.lang = lang;
      out.push(block);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*[-*]\s+/, ""));
        i += 1;
      }
      out.push({ kind: "ul", items });
      continue;
    }
    const paragraph: string[] = [line];
    i += 1;
    while (i < lines.length && (lines[i] ?? "").trim() && !/^(#{1,6}\s|```|\s*[-*]\s)/.test(lines[i] ?? "")) {
      paragraph.push(lines[i] ?? "");
      i += 1;
    }
    out.push({ kind: "p", text: paragraph.join(" ") });
  }
  return out;
}

function renderBlock(block: Block, idx: number) {
  switch (block.kind) {
    case "h": {
      const sizes = ["text-base font-semibold", "text-sm font-semibold", "text-sm font-medium"];
      const tone = sizes[Math.min(block.level - 1, sizes.length - 1)];
      return (
        <div key={idx} className={cn("text-reflex-fg", tone)}>
          {block.text}
        </div>
      );
    }
    case "code":
      return (
        <pre
          key={idx}
          className="bg-reflex-bg border border-reflex-border rounded p-3 font-mono text-xs overflow-auto"
        >
          <code>{block.text}</code>
        </pre>
      );
    case "ul":
      return (
        <ul key={idx} className="list-disc pl-5 grid gap-1">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "p":
    default:
      return <p key={idx}>{block.text}</p>;
  }
}
