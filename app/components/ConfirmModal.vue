<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="$emit('cancel')">
        <div class="modal-content">
          <h3 class="modal-title">{{ title }}</h3>
          <p class="modal-message">{{ message }}</p>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="$emit('cancel')">Cancelar</button>
            <button class="btn btn-primary" @click="$emit('confirm')">Confirmar</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
  message: string
}>()

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 9999;
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) + var(--safe-area-bottom));
}

.modal-content {
  background: var(--color-surface-elevated);
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  width: 100%;
  max-width: 400px;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5);
}

.modal-title {
  margin: 0 0 var(--spacing-sm) 0;
  color: white;
  font-size: 1.25rem;
  text-align: center;
}

.modal-message {
  color: var(--color-text-secondary);
  text-align: center;
  margin: 0 0 var(--spacing-xl) 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.modal-actions .btn {
  width: 100%;
}

/* Transition */
.modal-enter-active {
  transition: opacity 0.2s ease;
}

.modal-leave-active {
  transition: opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content {
  animation: slideFromBottom 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-leave-active .modal-content {
  animation: slideToBottom 0.2s ease forwards;
}

@keyframes slideFromBottom {
  from { 
    transform: translateY(100%);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideToBottom {
  from { 
    transform: translateY(0);
    opacity: 1;
  }
  to { 
    transform: translateY(100%);
    opacity: 0;
  }
}

/* Desktop: Center the modal */
@media (min-width: 768px) {
  .modal-overlay {
    align-items: center;
  }
  
  .modal-actions {
    flex-direction: row;
  }
}
</style>
