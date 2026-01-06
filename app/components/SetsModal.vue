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
                <span class="set-number">#{{ index + 1 }}</span>
                <span class="set-weight">{{ set.weight }}kg</span>
                <span class="set-reps">{{ set.reps }} reps</span>
              </div>
              <button class="btn-icon danger sm" @click="removeSet(index)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6L6 18M6 6l12 12"/></svg>
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
  margin-bottom: var(--spacing-xl);
}
</style>
