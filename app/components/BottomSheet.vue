<template>
  <Transition name="fade">
    <div v-if="localShow" class="bottom-sheet-backdrop" @click="close">
      <Transition name="slide-up">
        <div v-if="localShow" class="bottom-sheet" @click.stop>
          <div class="bottom-sheet-handle-bar">
            <div class="bottom-sheet-handle"></div>
          </div>
          <div class="bottom-sheet-content">
            <slot></slot>
          </div>
          <div class="bottom-sheet-actions">
            <!-- Cancel button is standard for bottom sheets -->
            <button class="btn btn-secondary w-full" @click="close">Cancelar</button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show', 'close'])

const localShow = ref(props.show)

watch(() => props.show, (newVal) => {
  localShow.value = newVal
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const close = () => {
  emit('update:show', false)
  emit('close')
}
</script>

<style scoped>
.bottom-sheet-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  backdrop-filter: blur(2px);
}

.bottom-sheet {
  background-color: var(--color-surface);
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) + var(--safe-area-bottom));
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
  border-top: 1px solid var(--color-border);
}

.bottom-sheet-handle-bar {
  display: flex;
  justify-content: center;
  padding-bottom: var(--spacing-lg);
  padding-top: var(--spacing-xs);
}

.bottom-sheet-handle {
  width: 40px;
  height: 4px;
  background-color: var(--color-border);
  border-radius: var(--radius-full);
}

.bottom-sheet-content {
  margin-bottom: var(--spacing-lg);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.w-full {
  width: 100%;
}
</style>
