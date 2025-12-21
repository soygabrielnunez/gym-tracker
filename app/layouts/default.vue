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
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.logo {
  font-weight: 900;
  font-size: 1.5rem;
  color: white;
  text-decoration: none;
  letter-spacing: -0.05em;
}

.highlight {
  color: var(--color-primary);
}

.main-content {
  flex: 1;
}
</style>
