<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('cancel')">
      <div class="modal-content">
        <h3 class="h4 mb-4">{{ title }}</h3>
        
        <input 
            ref="inputRef"
            v-model="inputValue" 
            type="text" 
            class="input mb-4" 
            :placeholder="placeholder"
            @keyup.enter="handleConfirm"
        />

        <div style="display:flex; gap:10px">
          <button class="btn btn-secondary" @click="$emit('cancel')">Cancelar</button>
          <button class="btn btn-primary" @click="handleConfirm">Confirmar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps({
  show: Boolean,
  title: String,
  placeholder: String,
  initialValue: {
      type: String,
      default: ''
  }
})

const emit = defineEmits(['confirm', 'cancel', 'update:modelValue'])

const inputValue = ref(props.initialValue)
const inputRef = ref<HTMLInputElement | null>(null)

watch(() => props.show, (newVal) => {
    if (newVal) {
        inputValue.value = props.initialValue
        // Focus input on open
        nextTick(() => {
            inputRef.value?.focus()
        })
    }
})

const handleConfirm = () => {
    if (inputValue.value.trim()) {
        emit('confirm', inputValue.value.trim())
    }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  background-color: #1e1e1e;
  padding: 2rem;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  border: 1px solid #333;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
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
