import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import { marked } from 'marked'

/**
 * Convert HTML string to Markdown format
 *
 * Uses TurndownService with the following configuration:
 * - Heading style: ATX (using # symbols)
 * - Code block style: Fenced (using ```)
 * - Bullet list marker: - (dash)
 * - Emphasis delimiter: * (asterisk)
 * - GFM plugin enabled for table support
 *
 * @param html - HTML string to convert
 * @returns Markdown formatted string
 * @throws {Error} If the conversion fails or input is invalid
 *
 * @example
 * ```ts
 * const html = '<h1>Hello World</h1><p>This is <strong>bold</strong></p>'
 * const markdown = htmlToMarkdown(html)
 * // Returns: "# Hello World\n\nThis is **bold**"
 * ```
 */
export function htmlToMarkdown(html: string): string {
  if (typeof html !== 'string') {
    throw new Error('Input must be a string')
  }

  try {
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
      emDelimiter: '*'
    })

    // Use GFM plugin for GitHub Flavored Markdown features (tables, strikethrough, etc.)
    turndownService.use(gfm)

    // Add custom rule to force ATX-style headings for h1 and h2
    // TurndownService defaults to Setext style (underlines) for h1/h2
    // This must be added AFTER the GFM plugin to override its rules
    turndownService.addRule('heading', {
      filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      replacement: function (content, node) {
        const hLevel = Number(node.nodeName.charAt(1))
        const hPrefix = '#'.repeat(hLevel)
        return '\n\n' + hPrefix + ' ' + content + '\n\n'
      }
    })

    // Add custom strikethrough rule to use double tilde ~~
    // GFM plugin uses single tilde ~, but standard GFM markdown uses ~~
    turndownService.addRule('strikethrough', {
      filter: ['del', 's', 'strike'] as Array<keyof HTMLElementTagNameMap>,
      replacement: function (content) {
        return '~~' + content + '~~'
      }
    })

    let markdown = turndownService.turndown(html)

    // Post-process: Replace list items with 3 spaces after marker with single space
    // TurndownService adds extra spaces: "-   Item" -> "- Item"
    // Also handle nested lists: "    -   Item" -> "  - Item"
    markdown = markdown.replace(/^(\s*)([-*+]|\d+\.)\s{3}/gm, (_match, indent, marker) => {
      // For nested items, use 2-space indentation instead of 4
      const newIndent = indent.replace(/ {4}/g, '  ')
      return newIndent + marker + ' '
    })

    return markdown
  } catch (error) {
    throw new Error(
      `Failed to convert HTML to Markdown: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Convert Markdown string to HTML format
 *
 * Uses marked library with the following configuration:
 * - GFM (GitHub Flavored Markdown): Enabled
 * - Breaks: Disabled (requires two spaces or newline for line breaks)
 *
 * @param markdown - Markdown string to convert
 * @returns HTML string
 * @throws {Error} If the parsing fails or input is invalid
 *
 * @example
 * ```ts
 * const markdown = '# Hello World\n\nThis is **bold**'
 * const html = markdownToHtml(markdown)
 * // Returns: "<h1>Hello World</h1>\n<p>This is <strong>bold</strong></p>"
 * ```
 */
export function markdownToHtml(markdown: string): string {
  if (typeof markdown !== 'string') {
    throw new Error('Input must be a string')
  }

  try {
    // Configure marked options
    marked.setOptions({
      gfm: true,
      breaks: false
    })

    // Parse markdown to HTML (marked.parse can be async, but we use sync version)
    const html = marked.parse(markdown, { async: false }) as string

    return html
  } catch (error) {
    throw new Error(
      `Failed to convert Markdown to HTML: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Detect if a text string contains Markdown syntax
 *
 * Uses heuristic pattern matching to identify common Markdown elements:
 * - Headers: # ## ### #### ##### ######
 * - Bold: **text**
 * - Italic: *text*
 * - Links: [text](url)
 * - Lists: -, *, + at line start
 * - Blockquotes: > at line start
 * - Code blocks: ```
 *
 * @param text - Plain text string to check for Markdown syntax
 * @returns true if Markdown syntax is detected, false otherwise
 *
 * @example
 * ```ts
 * detectMarkdown('# Hello World')  // true
 * detectMarkdown('**bold text**')  // true
 * detectMarkdown('Plain text')     // false
 * detectMarkdown('')               // false
 * ```
 */
export function detectMarkdown(text: string): boolean {
  // Validate input type
  if (typeof text !== 'string') {
    return false
  }

  // Trim whitespace and check if empty
  const trimmedText = text.trim()
  if (trimmedText.length === 0) {
    return false
  }

  // Check for common Markdown patterns
  // Using multiline flag (m) for patterns that check line start (^ anchor)
  return (
    /^#{1,6}\s/m.test(trimmedText) || // Headers: # ## ### etc.
    /\*\*.*\*\*/.test(trimmedText) || // Bold: **text**
    /\*[^*]+\*/.test(trimmedText) || // Italic: *text* (but not **)
    /\[.*\]\(.*\)/.test(trimmedText) || // Links: [text](url)
    /^[-*+]\s/m.test(trimmedText) || // Lists: -, *, + at line start
    /^>\s/m.test(trimmedText) || // Blockquote: > at line start
    /```/.test(trimmedText) // Code blocks: ```
  )
}
