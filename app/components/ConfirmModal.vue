<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="sheet-overlay" @click.self="$emit('cancel')">
        <div class="sheet-content">
          <div class="sheet-header">
            <h3 class="sheet-title">{{ title }}</h3>
          </div>
          <p class="text-center text-muted mb-4">{{ message }}</p>
          <div class="sheet-actions">
            <slot name="actions">
              <button class="btn btn-secondary" @click="$emit('cancel')">{{ cancelText || 'Cancelar' }}</button>
              <button 
                class="btn" 
                :class="confirmType === 'danger' ? 'btn-danger' : 'btn-primary'"
                @click="$emit('confirm')"
              >
                {{ confirmText || 'Confirmar' }}
              </button>
            </slot>
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
  confirmText?: string
  cancelText?: string
  confirmType?: 'primary' | 'danger'
}>()

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
/* Using global .sheet- styles from main.css */
</style>
