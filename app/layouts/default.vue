<template>
  <div class="container">
    <header class="header">
      <NuxtLink to="/" class="logo">GYM<span class="highlight">TRACKER</span></NuxtLink>
    </header>
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.header {
  padding: var(--spacing-sm) 0;
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  min-height: var(--touch-target-min);
}

.logo {
  font-weight: 900;
  font-size: 1.25rem;
  color: white;
  text-decoration: none;
  letter-spacing: -0.03em;
}

.highlight {
  color: var(--color-primary);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
