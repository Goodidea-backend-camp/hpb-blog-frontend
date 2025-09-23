<script setup>
definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <div>
    <div class="prose mb-6 max-w-none">
      <h1>Admin Panel</h1>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      </p>
    </div>
    <div
      data-testid="admin-main-content"
      class="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min"
    />
  </div>
</template>
