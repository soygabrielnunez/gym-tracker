<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="sheet-overlay" @click.self="$emit('close')">
        <div class="sheet-content">
          <div class="sheet-header">
            <h3 class="sheet-title">Series Realizadas</h3>
          </div>

          <div v-if="sets.length === 0" class="empty-state">
            <p>Aún no has registrado ninguna serie.</p>
          </div>

          <div v-else class="sets-list sheet-body">
            <div v-for="(set, index) in sets" :key="index" class="set-row">
              <div class="set-info">
                <span class="set-label">Serie {{ index + 1 }}</span>
                <div class="set-metrics">
                  <span class="set-reps">{{ set.reps }}<span class="unit">reps</span></span>
                  <span class="separator">×</span>
                  <span class="set-weight">{{ set.weight }}<span class="unit">kg</span></span>
                </div>
              </div>
              <button class="btn-delete" @click="removeSet(index)" aria-label="Eliminar serie">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          <div class="sheet-actions">
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

<style>
/* Using global .sheet- styles from main.css */

.sets-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.set-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: transform 0.1s;
}

.set-row:active {
    transform: scale(0.98);
    background-color: rgba(255, 68, 68, 0.05); /* Subtle red tint on active */
    border-color: var(--color-danger);
}

.set-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.set-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.set-metrics {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.unit {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-text-muted);
    margin-left: 2px;
}

.separator {
    color: var(--color-text-muted);
    font-size: 1rem;
    font-weight: 400;
}

.btn-delete {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background-color: rgba(255, 68, 68, 0.1);
    border: none;
    border-radius: var(--radius-full);
    color: var(--color-danger);
    cursor: pointer;
    transition: all 0.2s;
}

.btn-delete:active {
    background-color: var(--color-danger);
    color: white;
}
</style>
