<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { DEFAULT_SKELETON_ROWS } from '@/constants/ui'

interface ArticleTableSkeletonProps {
  rows?: number
}

const props = withDefaults(defineProps<ArticleTableSkeletonProps>(), {
  rows: DEFAULT_SKELETON_ROWS
})
</script>

<template>
  <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Skeleton class="h-4 w-12" />
          </TableHead>
          <TableHead>
            <Skeleton class="h-4 w-24" />
          </TableHead>
          <TableHead>
            <Skeleton class="h-4 w-24" />
          </TableHead>
          <TableHead>
            <Skeleton class="h-4 w-16" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="i in props.rows" :key="i">
          <TableCell>
            <Skeleton class="h-4 w-full max-w-xs" />
          </TableCell>
          <TableCell>
            <Skeleton class="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton class="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton class="h-8 w-8" />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
