import type { ColumnDef } from '@tanstack/vue-table'
import type { Article } from '@/types/api'
import { h } from 'vue'
import { convertUtcToLocal } from '@/utils/datetime'
import Button from '@/components/ui/button/Button.vue'

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
      return h('div', { class: 'flex gap-2' }, [
        h(
          Button,
          {
            variant: 'outline',
            size: 'sm'
          },
          () => 'Edit'
        ),
        h(
          Button,
          {
            variant: 'destructive',
            size: 'sm'
          },
          () => 'Delete'
        )
      ])
    }
  }
]
