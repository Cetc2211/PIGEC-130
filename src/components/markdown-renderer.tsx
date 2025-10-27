'use client';

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="space-y-4 text-sm bg-muted/50 p-4 rounded-lg overflow-x-auto">
      <pre className="font-code whitespace-pre-wrap break-words">{content}</pre>
    </div>
  );
}
