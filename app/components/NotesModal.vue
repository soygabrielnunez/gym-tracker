<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="cancel">
        <div class="modal-content">
          <h3 class="modal-title">Notas del Ejercicio</h3>

          <!-- Base Notes (Read-only) -->
          <div v-if="baseNotes" class="base-notes-section">
            <div class="notes-label">Notas de la Rutina:</div>
            <p class="notes-text">{{ baseNotes }}</p>
          </div>

          <!-- Session Notes (Editable) -->
          <textarea
            v-model="editableNotes"
            class="notes-textarea"
            placeholder="Añade notas para esta sesión..."
            rows="4"
          ></textarea>

          <div class="modal-actions">
            <button class="btn btn-secondary" @click="cancel">Cancelar</button>
            <button class="btn btn-primary" @click="save">Guardar</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  baseNotes?: string
  modelValue: string
}>()

const emit = defineEmits(['update:modelValue', 'close'])

const editableNotes = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  editableNotes.value = newVal
})

watch(() => props.show, (isShown) => {
  if (isShown) {
    editableNotes.value = props.modelValue
  }
})

const save = () => {
  emit('update:modelValue', editableNotes.value)
  emit('close')
}

const cancel = () => {
  emit('close')
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

.base-notes-section {
    background-color: var(--color-surface);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-md);
    border: 1px solid var(--color-border);
}

.notes-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--color-text-muted);
    margin-bottom: 4px;
}

.notes-text {
    font-size: 0.9rem;
    color: var(--color-text);
    margin: 0;
    line-height: 1.4;
    white-space: pre-wrap;
}

.notes-textarea {
  width: 100%;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  color: var(--color-text);
  font-size: 1rem;
  margin-bottom: var(--spacing-xl);
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>