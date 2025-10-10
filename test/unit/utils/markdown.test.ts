import { describe, it, expect } from 'vitest'
import { htmlToMarkdown, markdownToHtml } from '@/utils/markdown'

describe('markdown utilities', () => {
  describe('htmlToMarkdown', () => {
    describe('headings', () => {
      it('should convert h1 to markdown', () => {
        const html = '<h1>Hello World</h1>'
        const result = htmlToMarkdown(html)
        expect(result).toBe('# Hello World')
      })

      it('should convert h2 to markdown', () => {
        const html = '<h2>Subtitle</h2>'
        const result = htmlToMarkdown(html)
        expect(result).toBe('## Subtitle')
      })

      it('should convert h3 to markdown', () => {
        const html = '<h3>Section</h3>'
        const result = htmlToMarkdown(html)
        expect(result).toBe('### Section')
      })

      it('should convert h4 to markdown', () => {
        const html = '<h4>Subsection</h4>'
        const result = htmlToMarkdown(html)
        expect(result).toBe('#### Subsection')
      })

      it('should convert h5 to markdown', () => {
        const html = '<h5>Minor heading</h5>'
        const result = htmlToMarkdown(html)
        expect(result).toBe('##### Minor heading')
      })

      it('should convert h6 to markdown', () => {
        const html = '<h6>Smallest heading</h6>'
        const result = htmlToMarkdown(html)
        expect(result).toBe('###### Smallest heading')
      })
    })

    describe('text formatting', () => {
      it('should convert strong to bold markdown', () => {
        const html = '<p>This is <strong>bold</strong> text</p>'
        const result = htmlToMarkdown(html)
        expect(result).toBe('This is **bold** text')
      })

      it('should convert b to bold markdown', () => {
        const html = '<p>This is <b>bold</b> text</p>'
        const result = htmlToMarkdown(html)
        expect(result).toBe('This is **bold** text')
      })

      it('should convert em to italic markdown', () => {
        const html = '<p>This is <em>italic</em> text</p>'
        const result = htmlToMarkdown(html)
        expect(result).toBe('This is *italic* text')
      })

      it('should convert i to italic markdown', () => {
        const html = '<p>This is <i>italic</i> text</p>'
        const result = htmlToMarkdown(html)
        expect(result).toBe('This is *italic* text')
      })

      it('should convert strike/s to strikethrough markdown', () => {
        const html = '<p>This is <strike>strikethrough</strike> text</p>'
        const result = htmlToMarkdown(html)
        expect(result).toBe('This is ~~strikethrough~~ text')
      })

      it('should convert code to inline code markdown', () => {
        const html = '<p>Use <code>console.log()</code> to debug</p>'
        const result = htmlToMarkdown(html)
        expect(result).toBe('Use `console.log()` to debug')
      })
    })

    describe('lists', () => {
      it('should convert unordered list to markdown', () => {
        const html = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>'
        const result = htmlToMarkdown(html)
        expect(result).toBe('- Item 1\n- Item 2\n- Item 3')
      })

      it('should convert ordered list to markdown', () => {
        const html = '<ol><li>First</li><li>Second</li><li>Third</li></ol>'
        const result = htmlToMarkdown(html)
        expect(result).toBe('1.  First\n2.  Second\n3.  Third')
      })

      it('should convert nested lists to markdown', () => {
        const html =
          '<ul><li>Item 1<ul><li>Nested 1</li><li>Nested 2</li></ul></li><li>Item 2</li></ul>'
        const result = htmlToMarkdown(html)
        expect(result).toContain('- Item 1')
        expect(result).toContain('  - Nested 1')
        expect(result).toContain('  - Nested 2')
        expect(result).toContain('- Item 2')
      })
    })

    describe('links and images', () => {
      it('should convert links to markdown', () => {
        const html = '<a href="https://example.com">Example Link</a>'
        const result = htmlToMarkdown(html)
        expect(result).toBe('[Example Link](https://example.com)')
      })

      it('should convert images to markdown', () => {
        const html = '<img src="https://example.com/image.png" alt="Example Image">'
        const result = htmlToMarkdown(html)
        expect(result).toBe('![Example Image](https://example.com/image.png)')
      })

      it('should handle links without href', () => {
        const html = '<a>No href link</a>'
        const result = htmlToMarkdown(html)
        expect(result).toBe('No href link')
      })
    })

    describe('code blocks', () => {
      it('should convert pre code to fenced code block', () => {
        const html = '<pre><code>const x = 1;\nconsole.log(x);</code></pre>'
        const result = htmlToMarkdown(html)
        expect(result).toContain('```')
        expect(result).toContain('const x = 1;')
        expect(result).toContain('console.log(x);')
      })

      it('should handle code blocks with language class', () => {
        const html = '<pre><code class="language-javascript">const x = 1;</code></pre>'
        const result = htmlToMarkdown(html)
        expect(result).toContain('```')
        expect(result).toContain('const x = 1;')
      })
    })

    describe('blockquotes', () => {
      it('should convert blockquote to markdown', () => {
        const html = '<blockquote><p>This is a quote</p></blockquote>'
        const result = htmlToMarkdown(html)
        expect(result).toBe('> This is a quote')
      })

      it('should handle multi-line blockquotes', () => {
        const html = '<blockquote><p>Line 1</p><p>Line 2</p></blockquote>'
        const result = htmlToMarkdown(html)
        expect(result).toContain('> Line 1')
        expect(result).toContain('> Line 2')
      })
    })

    describe('horizontal rules', () => {
      it('should convert hr to markdown', () => {
        const html = '<p>Before</p><hr><p>After</p>'
        const result = htmlToMarkdown(html)
        expect(result).toContain('* * *')
      })
    })

    describe('complex html', () => {
      it('should convert complex nested html', () => {
        const html = `
          <h1>Article Title</h1>
          <p>This is a <strong>bold</strong> and <em>italic</em> paragraph.</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
          <p>Check out <a href="https://example.com">this link</a>.</p>
        `
        const result = htmlToMarkdown(html)
        expect(result).toContain('Article Title')
        expect(result).toContain('**bold**')
        expect(result).toContain('*italic*')
        expect(result).toContain('- Item 1')
        expect(result).toContain('[this link](https://example.com)')
      })
    })

    describe('edge cases', () => {
      it('should handle empty string', () => {
        const result = htmlToMarkdown('')
        expect(result).toBe('')
      })

      it('should handle plain text (no html)', () => {
        const result = htmlToMarkdown('Plain text')
        expect(result).toBe('Plain text')
      })

      it('should handle whitespace-only string', () => {
        const result = htmlToMarkdown('   \n  \t  ')
        expect(typeof result).toBe('string')
      })

      it('should throw error for non-string input', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => htmlToMarkdown(null as any)).toThrow('Input must be a string')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => htmlToMarkdown(undefined as any)).toThrow('Input must be a string')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => htmlToMarkdown(123 as any)).toThrow('Input must be a string')
      })
    })

    describe('tables', () => {
      it('should convert html tables to markdown tables', () => {
        const html = `
          <table>
            <thead>
              <tr>
                <th>Header 1</th>
                <th>Header 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cell 1</td>
                <td>Cell 2</td>
              </tr>
            </tbody>
          </table>
        `
        const result = htmlToMarkdown(html)
        expect(result).toContain('Header 1')
        expect(result).toContain('Header 2')
        expect(result).toContain('Cell 1')
        expect(result).toContain('Cell 2')
        expect(result).toContain('|')
      })
    })
  })

  describe('markdownToHtml', () => {
    describe('headings', () => {
      it('should convert markdown h1 to html', () => {
        const markdown = '# Hello World'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<h1')
        expect(result).toContain('Hello World')
        expect(result).toContain('</h1>')
      })

      it('should convert markdown h2 to html', () => {
        const markdown = '## Subtitle'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<h2')
        expect(result).toContain('Subtitle')
        expect(result).toContain('</h2>')
      })

      it('should convert markdown h3 to html', () => {
        const markdown = '### Section'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<h3')
        expect(result).toContain('Section')
        expect(result).toContain('</h3>')
      })

      it('should convert all heading levels', () => {
        const markdown = '# H1\n## H2\n### H3\n#### H4\n##### H5\n###### H6'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<h1')
        expect(result).toContain('<h2')
        expect(result).toContain('<h3')
        expect(result).toContain('<h4')
        expect(result).toContain('<h5')
        expect(result).toContain('<h6')
      })
    })

    describe('text formatting', () => {
      it('should convert bold markdown to html', () => {
        const markdown = 'This is **bold** text'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<strong>bold</strong>')
      })

      it('should convert italic markdown to html', () => {
        const markdown = 'This is *italic* text'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<em>italic</em>')
      })

      it('should convert strikethrough markdown to html (GFM)', () => {
        const markdown = 'This is ~~strikethrough~~ text'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<del>strikethrough</del>')
      })

      it('should convert inline code to html', () => {
        const markdown = 'Use `console.log()` to debug'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<code>console.log()</code>')
      })

      it('should handle combined formatting', () => {
        const markdown = 'This is **bold and *italic***'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<strong>')
        expect(result).toContain('<em>')
      })
    })

    describe('lists', () => {
      it('should convert unordered list to html', () => {
        const markdown = '- Item 1\n- Item 2\n- Item 3'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<ul>')
        expect(result).toContain('<li>Item 1</li>')
        expect(result).toContain('<li>Item 2</li>')
        expect(result).toContain('<li>Item 3</li>')
        expect(result).toContain('</ul>')
      })

      it('should convert ordered list to html', () => {
        const markdown = '1. First\n2. Second\n3. Third'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<ol>')
        expect(result).toContain('<li>First</li>')
        expect(result).toContain('<li>Second</li>')
        expect(result).toContain('<li>Third</li>')
        expect(result).toContain('</ol>')
      })

      it('should handle nested lists', () => {
        const markdown = '- Item 1\n  - Nested 1\n  - Nested 2\n- Item 2'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<ul>')
        expect(result).toContain('<li>Item 1')
        expect(result).toContain('<li>Nested 1</li>')
        expect(result).toContain('<li>Nested 2</li>')
        expect(result).toContain('<li>Item 2</li>')
      })
    })

    describe('links and images', () => {
      it('should convert links to html', () => {
        const markdown = '[Example Link](https://example.com)'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<a href="https://example.com"')
        expect(result).toContain('Example Link')
        expect(result).toContain('</a>')
      })

      it('should convert images to html', () => {
        const markdown = '![Example Image](https://example.com/image.png)'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<img')
        expect(result).toContain('src="https://example.com/image.png"')
        expect(result).toContain('alt="Example Image"')
      })

      it('should handle links with titles', () => {
        const markdown = '[Link](https://example.com "Title")'
        const result = markdownToHtml(markdown)
        expect(result).toContain('href="https://example.com"')
        expect(result).toContain('title="Title"')
      })
    })

    describe('code blocks', () => {
      it('should convert fenced code blocks to html', () => {
        const markdown = '```\nconst x = 1;\nconsole.log(x);\n```'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<pre>')
        expect(result).toContain('<code>')
        expect(result).toContain('const x = 1;')
        expect(result).toContain('console.log(x);')
        expect(result).toContain('</code>')
        expect(result).toContain('</pre>')
      })

      it('should handle code blocks with language', () => {
        const markdown = '```javascript\nconst x = 1;\n```'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<code')
        expect(result).toContain('const x = 1;')
      })

      it('should handle indented code blocks', () => {
        const markdown = '    const x = 1;\n    console.log(x);'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<pre>')
        expect(result).toContain('<code>')
        expect(result).toContain('const x = 1;')
      })
    })

    describe('blockquotes', () => {
      it('should convert blockquotes to html', () => {
        const markdown = '> This is a quote'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<blockquote>')
        expect(result).toContain('This is a quote')
        expect(result).toContain('</blockquote>')
      })

      it('should handle multi-line blockquotes', () => {
        const markdown = '> Line 1\n> Line 2'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<blockquote>')
        expect(result).toContain('Line 1')
        expect(result).toContain('Line 2')
      })
    })

    describe('horizontal rules', () => {
      it('should convert horizontal rules to html', () => {
        const markdown = 'Before\n\n---\n\nAfter'
        const result = markdownToHtml(markdown)
        expect(result).toContain('<hr')
      })

      it('should handle different hr styles', () => {
        const markdown1 = '---'
        const markdown2 = '***'
        const markdown3 = '___'

        expect(markdownToHtml(markdown1)).toContain('<hr')
        expect(markdownToHtml(markdown2)).toContain('<hr')
        expect(markdownToHtml(markdown3)).toContain('<hr')
      })
    })

    describe('GFM features', () => {
      it('should support GFM tables', () => {
        const markdown = `
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
        `
        const result = markdownToHtml(markdown)
        expect(result).toContain('<table>')
        expect(result).toContain('<thead>')
        expect(result).toContain('<tbody>')
        expect(result).toContain('<th>Header 1</th>')
        expect(result).toContain('<th>Header 2</th>')
        expect(result).toContain('<td>Cell 1</td>')
        expect(result).toContain('</table>')
      })

      it('should support GFM task lists', () => {
        const markdown = '- [ ] Unchecked task\n- [x] Checked task'
        const result = markdownToHtml(markdown)
        expect(result).toContain('input')
        expect(result).toContain('checkbox')
      })

      it('should support GFM autolinks', () => {
        const markdown = 'Visit https://example.com for more info'
        const result = markdownToHtml(markdown)
        expect(result).toContain('href="https://example.com"')
      })
    })

    describe('complex markdown', () => {
      it('should convert complex markdown document', () => {
        const markdown = `
# Article Title

This is a paragraph with **bold** and *italic* text.

## Section

- Item 1
- Item 2

Check out [this link](https://example.com).

\`\`\`javascript
const x = 1;
console.log(x);
\`\`\`
        `
        const result = markdownToHtml(markdown)
        expect(result).toContain('<h1')
        expect(result).toContain('Article Title')
        expect(result).toContain('<strong>bold</strong>')
        expect(result).toContain('<em>italic</em>')
        expect(result).toContain('<h2')
        expect(result).toContain('<ul>')
        expect(result).toContain('<a href="https://example.com"')
        expect(result).toContain('<code')
      })
    })

    describe('edge cases', () => {
      it('should handle empty string', () => {
        const result = markdownToHtml('')
        expect(typeof result).toBe('string')
      })

      it('should handle plain text (no markdown)', () => {
        const result = markdownToHtml('Plain text')
        expect(result).toContain('Plain text')
      })

      it('should handle whitespace-only string', () => {
        const result = markdownToHtml('   \n  \t  ')
        expect(typeof result).toBe('string')
      })

      it('should throw error for non-string input', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => markdownToHtml(null as any)).toThrow('Input must be a string')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => markdownToHtml(undefined as any)).toThrow('Input must be a string')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => markdownToHtml(123 as any)).toThrow('Input must be a string')
      })

      it('should not convert single line breaks to <br> (breaks: false)', () => {
        const markdown = 'Line 1\nLine 2'
        const result = markdownToHtml(markdown)
        expect(result).not.toContain('<br')
      })
    })

    describe('special characters', () => {
      it('should handle escaped characters', () => {
        const markdown = 'This is \\*not italic\\*'
        const result = markdownToHtml(markdown)
        expect(result).toContain('*not italic*')
        expect(result).not.toContain('<em>')
      })

      it('should handle html entities', () => {
        const markdown = 'Use &lt; and &gt; symbols'
        const result = markdownToHtml(markdown)
        expect(result).toContain('&lt;')
        expect(result).toContain('&gt;')
      })
    })
  })

  describe('round-trip conversion', () => {
    it('should maintain content through markdown -> html -> markdown conversion', () => {
      const originalMarkdown =
        '# Title\n\nThis is **bold** and *italic* text.\n\n- Item 1\n- Item 2'
      const html = markdownToHtml(originalMarkdown)
      const backToMarkdown = htmlToMarkdown(html)

      // Should contain the same semantic content
      expect(backToMarkdown).toContain('Title')
      expect(backToMarkdown).toContain('**bold**')
      expect(backToMarkdown).toContain('*italic*')
      expect(backToMarkdown).toContain('- Item 1')
      expect(backToMarkdown).toContain('- Item 2')
    })

    it('should maintain content through html -> markdown -> html conversion', () => {
      const originalHtml =
        '<h1>Title</h1><p>This is <strong>bold</strong> text.</p><ul><li>Item 1</li><li>Item 2</li></ul>'
      const markdown = htmlToMarkdown(originalHtml)
      const backToHtml = markdownToHtml(markdown)

      // Should contain the same semantic elements
      expect(backToHtml).toContain('<h1')
      expect(backToHtml).toContain('Title')
      expect(backToHtml).toContain('<strong>bold</strong>')
      expect(backToHtml).toContain('<ul>')
      expect(backToHtml).toContain('<li>Item 1</li>')
    })

    it('should handle complex documents in round-trip', () => {
      const markdown = `
# Article

## Introduction

This is a paragraph with **bold**, *italic*, and \`code\`.

## Features

- Feature 1
- Feature 2
- Feature 3

[Link](https://example.com)

\`\`\`javascript
const x = 1;
\`\`\`
      `
      const html = markdownToHtml(markdown)
      const backToMarkdown = htmlToMarkdown(html)

      // Verify all key elements are preserved
      expect(backToMarkdown).toContain('Article')
      expect(backToMarkdown).toContain('Introduction')
      expect(backToMarkdown).toContain('**bold**')
      expect(backToMarkdown).toContain('*italic*')
      expect(backToMarkdown).toContain('`code`')
      expect(backToMarkdown).toContain('- Feature 1')
      expect(backToMarkdown).toContain('[Link](https://example.com)')
      expect(backToMarkdown).toContain('const x = 1;')
    })
  })
})
