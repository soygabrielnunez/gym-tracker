<template>
  <div>
    <h1 class="mb-4">Tu Gym <span style="color:white">Tracker</span></h1>
    
    <div class="card mb-8">
      <h2 class="h3">Inicio Rápido</h2>
      <button class="btn btn-primary mb-4" @click="startEmptyWorkout">
        <span style="font-size:1.5rem; margin-right:8px">+</span>
        Entrenar Ahora
      </button>
      <NuxtLink to="/workouts/create" class="btn btn-secondary">
        Crear Nueva Rutina
      </NuxtLink>
    </div>

    <div>
      <h2 class="h3 mb-4">Mis Rutinas</h2>
      <div v-if="workouts.length === 0" class="text-muted text-center" style="padding: 2rem 0">
        No hay rutinas guardadas.
      </div>
      <div v-else class="workout-list">
        <div v-for="workout in workouts" :key="workout.id" class="card mb-4 workout-card" @click="startWorkout(workout.id)">
          <div style="display:flex; align-items: flex-start; justify-content: space-between;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex: 1">
            <h3 style="margin:0">{{ workout.name }}</h3>
            <span style="color:var(--color-primary); margin-right: 1rem">►</span>
          </div>
            <p class="text-muted" style="margin:0.5rem 0 0 0">
              {{ workout.exercises.length }} ejercicios
            </p>
          </div>
           <button 
              class="btn-icon delete-btn routine-delete-btn" 
              @click.stop="confirmDeleteWorkout(workout.id)"
              title="Eliminar rutina"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
        </div>
      </div>
    </div>

    <div class="mt-8">
      <h2 class="h3 mb-4">Historial Reciente</h2>
      <div v-if="history.length === 0" class="text-muted text-center" style="padding: 2rem 0">
        No hay entrenamientos completados.
      </div>
      <div v-else class="history-list">
        <div v-for="session in history" :key="session.id" class="card mb-4 history-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start">
            <div>
              <h3 class="h4" style="margin:0 0 0.5rem 0">{{ session.name }}</h3>
              <p class="text-muted" style="margin:0; font-size:0.9rem">
                {{ formatDate(session.endTime) }} • {{ session.exercises.length }} ejercicios
              </p>
            </div>
            <button 
              class="btn-icon delete-btn" 
              @click.stop="confirmDelete(session.id)"
              title="Eliminar del historial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ConfirmModal 
    :show="showDeleteModal"
    :title="modalTitle"
    :message="modalMessage"
    @confirm="handleDelete"
    @cancel="closeDeleteModal"
  />
</template>

<script setup lang="ts">

const { workouts, startSession } = useWorkouts()
const router = useRouter()

const startEmptyWorkout = () => {
  const sessionId = startSession()
  router.push(`/session/${sessionId}`)
}

const startWorkout = (workoutId: string) => {
  const sessionId = startSession(workoutId)
  router.push(`/session/${sessionId}`)
}

// Deletion Logic
const { history, deleteSession, deleteWorkout } = useWorkouts()
const showDeleteModal = ref(false)
const sessionToDelete = ref<string | null>(null)
const workoutToDelete = ref<string | null>(null)
const deleteType = ref<'history' | 'workout'>('history')
const modalTitle = ref('')
const modalMessage = ref('')

const confirmDelete = (sessionId: string) => {
  sessionToDelete.value = sessionId
  deleteType.value = 'history'
  modalTitle.value = '¿Eliminar historial?'
  modalMessage.value = 'Se eliminará este registro de entrenamiento.'
  showDeleteModal.value = true
}

const confirmDeleteWorkout = (workoutId: string) => {
  workoutToDelete.value = workoutId
  deleteType.value = 'workout'
  modalTitle.value = '¿Eliminar rutina?'
  modalMessage.value = 'Se eliminará la rutina y sus ejercicios configurados.'
  showDeleteModal.value = true
}

const handleDelete = () => {
  if (deleteType.value === 'history' && sessionToDelete.value) {
    deleteSession(sessionToDelete.value)
  } else if (deleteType.value === 'workout' && workoutToDelete.value) {
    deleteWorkout(workoutToDelete.value)
  }
  closeDeleteModal()
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  sessionToDelete.value = null
}

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.workout-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-card {
  transition: background-color 0.2s;
}
.history-card:hover {
  background-color: #1a1a1a;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background-color: rgba(255, 68, 68, 0.1);
  color: #ff4444;
}

.delete-btn {
  opacity: 0;
  transform: translateX(10px);
}

.history-card:hover .delete-btn {
  opacity: 1;
  transform: translateX(0);
}

@media (max-width: 768px) {
  .delete-btn {
    opacity: 1;
    transform: none;
  }
}

.workout-card {
  transition: background-color 0.2s;
  cursor: pointer;
}
.workout-card:hover {
  background-color: #1a1a1a;
}

.workout-card:hover .routine-delete-btn {
  opacity: 1;
  transform: translateX(0);
}
</style>
