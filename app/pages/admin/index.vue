<script setup>
definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <div>
    <div class="grid auto-rows-min gap-4 md:grid-cols-3">
      <div data-testid="admin-stats-card" class="bg-muted/50 aspect-video rounded-xl" />
      <div data-testid="admin-stats-card" class="bg-muted/50 aspect-video rounded-xl" />
      <div data-testid="admin-stats-card" class="bg-muted/50 aspect-video rounded-xl" />
    </div>
    <div
      data-testid="admin-main-content"
      class="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min"
    />
  </div>
</template>
