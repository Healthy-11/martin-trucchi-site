/**
 * Minimal inline-markdown renderer for CMS text fields.
 *
 * Lets Martin write links / bold / italic / code in plain JSON string fields
 * (home intro, about bio, ...) without pulling in a markdown dependency.
 * Everything is HTML-escaped first, so CMS content can never inject markup.
 *
 * Supported: [label](url)  **bold**  *italic*  `code`
 * Blocks: blank line = new paragraph, single newline = <br />
 */

const CODE_OPEN = '\u0000C';
const CODE_CLOSE = '\u0000';

function escapeHtml(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Only allow URLs we know are safe to put in an href. */
function safeUrl(url: string): string | null {
    const trimmed = url.trim();
    if (/^(https?:\/\/|mailto:|tel:|\/|#|\.\/|\.\.\/)/i.test(trimmed)) return trimmed;
    return null;
}

/** Render a single line/paragraph of inline markdown to HTML. */
export function inlineMarkdown(source: string): string {
    if (!source) return '';

    const codeSpans: string[] = [];
    let text = escapeHtml(source);

    // Stash code spans so their contents are left alone.
    text = text.replace(/`([^`]+)`/g, (_match, code: string) => {
        codeSpans.push(code);
        return `${CODE_OPEN}${codeSpans.length - 1}${CODE_CLOSE}`;
    });

    // [label](url) — external links open in a new tab.
    text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label: string, url: string) => {
        const href = safeUrl(url);
        if (!href) return label;
        const external = /^https?:\/\//i.test(href);
        const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${href}"${attrs}>${label}</a>`;
    });

    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');

    text = text.replace(/\u0000C(\d+)\u0000/g, (_match, index: string) => `<code>${codeSpans[Number(index)]}</code>`);

    return text;
}

/** Render a multi-paragraph CMS text field to HTML. */
export function richText(source: string): string {
    if (!source) return '';
    return source
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block) => `<p>${inlineMarkdown(block).replace(/\n/g, '<br />')}</p>`)
        .join('\n');
}
