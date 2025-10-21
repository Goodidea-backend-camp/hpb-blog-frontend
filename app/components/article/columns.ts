import type { ColumnDef } from '@tanstack/vue-table'
import type { Article } from '@/types/api'
import { h } from 'vue'
import { convertUtcToLocal } from '@/utils/datetime'
import Button from '@/components/ui/button/Button.vue'
import DropdownMenu from '@/components/ui/dropdown-menu/DropdownMenu.vue'
import DropdownMenuTrigger from '@/components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import DropdownMenuContent from '@/components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuItem from '@/components/ui/dropdown-menu/DropdownMenuItem.vue'
import DropdownMenuSeparator from '@/components/ui/dropdown-menu/DropdownMenuSeparator.vue'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-vue-next'

export const columns: ColumnDef<Article>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.getValue('title'))
  },
  {
    accessorKey: 'published_at',
    header: 'Published At',
    cell: ({ row }) => {
      const publishedAt = row.getValue('published_at') as string | null
      return h('div', publishedAt ? convertUtcToLocal(publishedAt) : 'Draft')
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => {
      const createdAt = row.getValue('created_at') as string
      return h('div', convertUtcToLocal(createdAt))
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => {
      return h(DropdownMenu, {}, () => [
        h(DropdownMenuTrigger, { asChild: true }, () =>
          h(
            Button,
            {
              variant: 'ghost',
              size: 'icon'
            },
            () => h(MoreHorizontal, { class: 'h-4 w-4' })
          )
        ),
        h(DropdownMenuContent, { align: 'end' }, () => [
          h(DropdownMenuItem, {}, () => [h(Pencil, { class: 'mr-2 h-4 w-4' }), 'Edit']),
          h(DropdownMenuSeparator),
          h(DropdownMenuItem, { variant: 'destructive' }, () => [
            h(Trash2, { class: 'mr-2 h-4 w-4' }),
            'Delete'
          ])
        ])
      ])
    }
  }
]
