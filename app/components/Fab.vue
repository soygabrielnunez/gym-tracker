<template>
  <Transition name="scale">
    <button v-if="show" class="fab" @click="$emit('click')">
      <slot>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </slot>
    </button>
  </Transition>
</template>

<script setup lang="ts">
defineProps({
  show: {
    type: Boolean,
    default: true
  }
})

defineEmits(['click'])
</script>

<style scoped>
.fab {
  position: fixed;
  bottom: calc(var(--spacing-lg) + var(--safe-area-bottom));
  right: var(--spacing-lg);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: #000;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: transform var(--transition-normal), background-color var(--transition-fast);
}

.fab:active {
  transform: scale(0.95);
  background-color: #b8e600; /* Darker primary */
}

/* Transitions */
.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0) rotate(-90deg);
  opacity: 0;
}
</style>
