import type { ReactNode } from 'react';

/** Convierte viñetas markdown (* ) y **negrilla** en texto legible en el chat. */
function normalizeListMarkers(text: string): string {
  return text
    .split('\n')
    .map((line) => line.replace(/^\*\s+/, '• '))
    .join('\n');
}

function renderInlineBold(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(
      <strong key={`${keyPrefix}-b-${i++}`} className="font-semibold">
        {match[1]}
      </strong>,
    );
    lastIndex = re.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length ? nodes : [text];
}

export function SupportChatMarkdown({ text }: { text: string }) {
  const normalized = normalizeListMarkers(text);
  const lines = normalized.split('\n');

  return (
    <>
      {lines.map((line, lineIndex) => (
        <span key={`line-${lineIndex}`}>
          {lineIndex > 0 ? '\n' : null}
          {renderInlineBold(line, `l${lineIndex}`)}
        </span>
      ))}
    </>
  );
}
