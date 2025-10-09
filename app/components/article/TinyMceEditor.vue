<script setup lang="ts">
// Import TinyMCE core first
import 'tinymce/tinymce'

// Import TinyMCE theme and icons
import 'tinymce/themes/silver'
import 'tinymce/icons/default'

// Import TinyMCE skin
import 'tinymce/skins/ui/oxide/skin.css'

// Import essential plugins
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/link'
import 'tinymce/plugins/image'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/code'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/media'
import 'tinymce/plugins/table'
import 'tinymce/plugins/help'
import 'tinymce/plugins/wordcount'
import 'tinymce/plugins/textpattern'

import Editor from '@tinymce/tinymce-vue'
import { marked } from 'marked'

interface Props {
  modelValue?: string
  disabled?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// TinyMCE configuration
const tinymceConfig = {
  height: 500,
  menubar: true,
  plugins: [
    'advlist',
    'autolink',
    'lists',
    'link',
    'image',
    'charmap',
    'preview',
    'anchor',
    'searchreplace',
    'visualblocks',
    'code',
    'fullscreen',
    'insertdatetime',
    'media',
    'table',
    'help',
    'wordcount',
    'textpattern'
  ],
  toolbar:
    'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
  content_css: false,
  skin: false,
  // Text pattern for markdown-style shortcuts while typing
  textpattern_patterns: [
    // Inline formatting
    { start: '**', end: '**', format: 'bold' },
    { start: '*', end: '*', format: 'italic' },
    { start: '__', end: '__', format: 'bold' },
    { start: '_', end: '_', format: 'italic' },
    { start: '~~', end: '~~', format: 'strikethrough' },
    { start: '`', end: '`', format: 'code' },
    // Block formatting
    { start: '#', format: 'h1' },
    { start: '##', format: 'h2' },
    { start: '###', format: 'h3' },
    { start: '####', format: 'h4' },
    { start: '#####', format: 'h5' },
    { start: '######', format: 'h6' },
    { start: '1. ', cmd: 'InsertOrderedList' },
    { start: '* ', cmd: 'InsertUnorderedList' },
    { start: '- ', cmd: 'InsertUnorderedList' },
    { start: '> ', format: 'blockquote' },
    { start: '---', replacement: '<hr/>' }
  ],
  // Setup function for paste event handling
  setup: (editor: {
    on: (event: string, handler: (e: ClipboardEvent) => void) => void
    insertContent: (content: string) => void
  }) => {
    editor.on('paste', (e: ClipboardEvent) => {
      // Get pasted content
      const clipboardData = e.clipboardData
      if (!clipboardData) return

      // Try to get plain text
      const pastedText = clipboardData.getData('text/plain')
      if (!pastedText || pastedText.trim().length === 0) return

      // Check if it looks like markdown (heuristic check)
      const hasMarkdownSyntax =
        /^#{1,6}\s/.test(pastedText) || // Headers
        /\*\*.*\*\*/.test(pastedText) || // Bold
        /\*.*\*/.test(pastedText) || // Italic
        /\[.*\]\(.*\)/.test(pastedText) || // Links
        /^[-*+]\s/.test(pastedText) || // Lists
        /^>\s/.test(pastedText) || // Blockquote
        /```/.test(pastedText) // Code blocks

      if (!hasMarkdownSyntax) return

      try {
        // Parse markdown to HTML
        const html = marked.parse(pastedText, { async: false }) as string

        // Prevent default paste
        e.preventDefault()

        // Insert the converted HTML
        editor.insertContent(html)
      } catch (error) {
        // If parsing fails, let default paste happen
        console.error('Markdown parsing failed:', error)
      }
    })
  }
}
</script>

<template>
  <Editor
    :model-value="modelValue"
    :init="tinymceConfig"
    :disabled="disabled"
    @update:model-value="(value: string) => emit('update:modelValue', value)"
  />
</template>
