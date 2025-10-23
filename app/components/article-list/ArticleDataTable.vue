<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef, SortingState } from '@tanstack/vue-table'
import { FlexRender, getCoreRowModel, getSortedRowModel, useVueTable } from '@tanstack/vue-table'
import { ref } from 'vue'
import { AlertCircle, RefreshCw } from 'lucide-vue-next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import ArticleTableSkeleton from './ArticleTableSkeleton.vue'
import type { ApiError } from '@/utils/errors'

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading: boolean
  error: ApiError | null
}>()

const emit = defineEmits<{
  retry: []
}>()

const sorting = ref<SortingState>([])

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  onSortingChange: (updaterOrValue) => {
    sorting.value =
      typeof updaterOrValue === 'function' ? updaterOrValue(sorting.value) : updaterOrValue
  },
  state: {
    get sorting() {
      return sorting.value
    }
  }
})
</script>

<template>
  <!-- Loading skeleton -->
  <ArticleTableSkeleton v-if="loading" />
  <!-- Error message and retry button -->
  <div
    v-else-if="error"
    class="border-destructive/50 bg-destructive/10 rounded-md border p-8"
    data-testid="error-state"
  >
    <div class="flex flex-col items-center justify-center gap-4 text-center">
      <AlertCircle class="text-destructive size-12" />
      <div class="space-y-2">
        <h3 class="text-destructive text-lg font-semibold">Failed to load articles</h3>
        <p class="text-muted-foreground text-sm">{{ error.message }}</p>
      </div>
      <Button variant="outline" class="mt-2" data-testid="retry-button" @click="emit('retry')">
        <RefreshCw class="mr-2 size-4" />
        Retry
      </Button>
    </div>
  </div>
  <!-- Data Table -->
  <div v-else class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id">
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="table.getRowModel().rows?.length">
          <TableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            :data-state="row.getIsSelected() ? 'selected' : undefined"
          >
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow>
            <TableCell :colspan="columns.length" class="h-24 text-center">
              No articles found.
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
