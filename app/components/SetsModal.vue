<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
          <h3 class="modal-title">Series Realizadas</h3>

          <div v-if="sets.length === 0" class="empty-state">
            <p>Aún no has registrado ninguna serie.</p>
          </div>

          <div v-else class="sets-list">
            <div v-for="(set, index) in sets" :key="index" class="set-row">
              <div class="set-info">
                <span class="set-number">#{{ index + 1 }}</span>
                <span class="set-weight">{{ set.weight }}kg</span>
                <span class="set-reps">{{ set.reps }} reps</span>
              </div>
              <button class="btn-icon danger sm" @click="removeSet(index)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn btn-secondary" @click="$emit('close')">Cerrar</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  sets: Array<{ weight: number; reps: number }>
}>()

const emit = defineEmits(['close', 'remove-set'])

const removeSet = (index: number) => {
  emit('remove-set', index)
}
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
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 9999;
  padding: var(--spacing-md);
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
  margin: 0 0 var(--spacing-lg) 0;
  color: white;
  font-size: 1.25rem;
  text-align: center;
}

.sets-list {
  margin-bottom: var(--spacing-xl);
}

.set-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-border);
}

.set-row:last-child {
  border-bottom: none;
}

.set-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-weight: 600;
}

.set-number {
  color: var(--color-text-muted);
}

.empty-state {
  text-align: center;
  color: var(--color-text-secondary);
  margin: var(--spacing-xl) 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
