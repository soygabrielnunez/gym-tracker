<template>
  <Transition name="modal">
    <div v-if="show" class="sheet-overlay" @click="$emit('close')">
      <div class="sheet-content" @click.stop>
        <div class="sheet-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md); text-align: left;">
          <h3 class="sheet-title">Lista de Ejercicios</h3>
          <button class="btn-close" @click="$emit('close')">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div class="exercise-list sheet-body">
          <div 
            v-for="(exercise, index) in exercises" 
            :key="index"
            class="exercise-item"
            :class="{ 
              'active': index === currentIndex,
              'completed': isExerciseComplete(exercise)
            }"
            @click="$emit('select-exercise', index)"
          >
            <div class="exercise-info">
              <span class="exercise-name">{{ exercise.name }}</span>
              <span class="exercise-status">
                {{ isExerciseComplete(exercise) ? 'Completado' : (index === currentIndex ? 'En curso' : 'Pendiente') }}
              </span>
            </div>
            <div class="exercise-indicator">
              <svg v-if="index === currentIndex" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3" fill="currentColor"></circle></svg>
              <svg v-else-if="isExerciseComplete(exercise)" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  exercises: any[]
  currentIndex: number
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'select-exercise', index: number): void
}>()

const isExerciseComplete = (ex: any) => {
    return ex.sets && ex.sets.length >= (ex.targetSets || 3)
}
</script>

<style scoped>
/* Using global .sheet- styles from main.css */

.btn-close {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding-bottom: var(--spacing-md);
}

.exercise-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-surface-elevated);
  border-radius: var(--radius-md);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.exercise-item:hover {
  background-color: var(--color-bg);
}

.exercise-item.active {
  border-color: var(--color-primary);
  background-color: rgba(204, 255, 0, 0.1);
}

.exercise-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.exercise-name {
  font-weight: 600;
  font-size: 1rem;
}

.exercise-status {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.exercise-indicator {
  color: var(--color-text-muted);
}

.exercise-item.active .exercise-indicator {
  color: var(--color-primary);
}

.exercise-item.completed .exercise-indicator {
  color: #4ade80;
}
</style>
