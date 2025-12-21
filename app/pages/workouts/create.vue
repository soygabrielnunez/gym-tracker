<template>
  <div>
    <NuxtLink to="/" class="btn btn-secondary mb-4" style="width:auto; display:inline-block">
        ← Volver
    </NuxtLink>
    <h1 class="mb-4">Nueva Rutina</h1>
    
    <div class="card mb-4">
      <label class="label">Nombre de la Rutina</label>
      <input 
        v-model="name" 
        class="input input-lg" 
        placeholder="Ej: Pierna Hipertrofia" 
        autofocus
      />
    </div>

    <div class="mb-8">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem">
        <h2 class="h3" style="margin:0">Ejercicios</h2>
      </div>

      <div v-if="exercises.length === 0" class="text-muted text-center" style="padding: 2rem 0; border: 1px dashed #333; border-radius: 12px">
        Añade ejercicios a tu rutina
      </div>

      <div v-else class="exercise-list">
        <div v-for="(exercise, index) in exercises" :key="index" class="card mb-2" style="padding: 1rem">
          <div style="display:flex; gap:10px">
            <span style="color:var(--color-primary); font-weight:bold">{{ index + 1 }}.</span>
            <input 
              v-model="exercise.name" 
              class="input" 
              style="padding:0.5rem; background:transparent; border:none; border-bottom:1px solid #333; border-radius:0"
              placeholder="Nombre del ejercicio"
            />
            <button @click="removeExercise(index)" style="background:none; border:none; color:#ff4444; font-size:1.5rem">×</button>
          </div>
        </div>
      </div>
      
      <button class="btn btn-secondary mt-4" @click="addExercise" style="margin-top:1rem">
        + Añadir Ejercicio
      </button>
    </div>

    <div style="position:sticky; bottom:20px">
      <button class="btn btn-primary" @click="saveWorkout">
        Guardar Rutina
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { createWorkout } = useWorkouts()
const router = useRouter()

const name = ref('')
const exercises = ref<any[]>([])

const addExercise = () => {
  exercises.value.push({
    name: '',
    targetSets: 3,
    targetReps: 10
  })
}

const removeExercise = (index: number) => {
  exercises.value.splice(index, 1)
}

const saveWorkout = () => {
  if (!name.value.trim()) return alert('Ponle nombre a la rutina')
  if (exercises.value.length === 0) return alert('Añade al menos un ejercicio')
  
  createWorkout(name.value, exercises.value)
  router.push('/')
}
</script>

<style scoped>
.label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: var(--color-text-dim);
}
</style>
