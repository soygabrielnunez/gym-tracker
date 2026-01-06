<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="sheet-overlay" @click.self="$emit('cancel')">
        <div class="sheet-content">
          <div class="sheet-header">
            <h3 class="sheet-title">{{ title }}</h3>
          </div>
          
          <input 
            ref="inputRef"
            v-model="inputValue" 
            type="text" 
            class="input mb-4" 
            :placeholder="placeholder"
            @keyup.enter="handleConfirm"
          />

          <div class="sheet-actions">
            <button class="btn btn-secondary" @click="$emit('cancel')">Cancelar</button>
            <button class="btn btn-primary" @click="handleConfirm">Confirmar</button>
          </div>
        </div>
      </div>
    </Transition>
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
/* Using global .sheet- styles from main.css */
</style>
