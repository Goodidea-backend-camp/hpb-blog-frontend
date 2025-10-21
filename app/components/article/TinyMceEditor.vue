<script setup lang="ts">
// Import TinyMCE core first
import 'tinymce/tinymce'

// Import TinyMCE theme and icons
import 'tinymce/themes/silver'
import 'tinymce/icons/default'

// Import TinyMCE skin
import 'tinymce/skins/ui/oxide/skin.css'

// Import essential plugins
import 'tinymce/plugins/lists'
import 'tinymce/plugins/link'
import 'tinymce/plugins/code'
import 'tinymce/plugins/table'
import 'tinymce/plugins/help'
import 'tinymce/plugins/textpattern'
import 'tinymce/plugins/autolink'

import Editor from '@tinymce/tinymce-vue'

interface Props {
  modelValue?: string
  disabled?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// TinyMCE configuration
const editorConfig = {
  menubar: false,
  plugins: ['lists', 'link', 'code', 'table', 'help', 'textpattern', 'autolink'],
  toolbar:
    'undo redo | blocks | bold italic | link | bullist numlist | outdent indent | table | code | removeformat | help',
  content_style:
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang TC", "Hiragino Sans GB", "Microsoft JhengHei", "Helvetica Neue", Arial, sans-serif; font-size: 14px }',

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
  ]
}
</script>

<template>
  <Editor
    :model-value="modelValue"
    :init="editorConfig"
    :disabled="disabled"
    @update:model-value="(value: string) => emit('update:modelValue', value)"
  />
</template>
