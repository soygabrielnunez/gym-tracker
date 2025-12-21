<template>
  <Teleport to="body">
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
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background: #1a1a1a;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid #333;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  animation: slideUp 0.2s ease-out;
}

.modal-title {
  margin-top: 0;
  color: white;
  font-size: 1.5rem;
  text-align: center;
}

.modal-message {
  color: #ccc;
  text-align: center;
  margin-bottom: 2rem;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
