<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-section mb-8">
      <h1 class="mb-4">Tu Gym <span class="text-white">Tracker</span></h1>
      
      <div class="card">
        <button class="btn btn-primary btn-hero mb-4" @click="startEmptyWorkout">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Entrenar Ahora
        </button>
        <NuxtLink to="/workouts/create" class="btn btn-secondary">
          Crear Nueva Rutina
        </NuxtLink>
      </div>
    </section>

    <!-- Routines Section -->
    <section class="mb-8">
      <div class="section-header">
        <h2 class="h3">Mis Rutinas</h2>
        <div class="header-actions">
          <button class="btn-icon secondary" @click="triggerImport" title="Importar Rutina">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </button>
          <span class="exercise-badge" v-if="workouts.length > 0">{{ workouts.length }}</span>
        </div>
      </div>

      <!-- Hidden File Input -->
      <input 
        type="file" 
        ref="fileInput" 
        accept=".json" 
        style="display: none" 
        @change="handleFileImport"
      />
      
      <div v-if="workouts.length === 0" class="empty-state">
        <p>No hay rutinas guardadas.</p>
        <p class="text-muted" style="font-size: 0.875rem; margin: 0">Crea una rutina o importa un archivo</p>
      </div>
      
      <div v-else class="row-stack">
        <div 
          v-for="workout in workouts" 
          :key="workout.id" 
          class="card card-interactive workout-card"
          @click="startWorkout(workout.id)"
        >
          <div class="row-between">
            <div class="workout-info">
              <h3 class="workout-name">{{ workout.name }}</h3>
              <p class="workout-meta text-muted">
                {{ workout.exercises.length }} ejercicios • {{ getTotalSets(workout) }} series
              </p>
            </div>
            <div class="workout-actions">
              <NuxtLink
                :to="`/workouts/${workout.id}`"
                class="btn-icon"
                title="Editar rutina"
                @click.stop
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </NuxtLink>
              <button 
                class="btn-icon" 
                @click.stop="handleExport(workout.id)"
                title="Exportar rutina"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              <button 
                class="btn-icon danger" 
                @click.stop="confirmDeleteWorkout(workout.id)"
                title="Eliminar rutina"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- History Section -->
    <section>
      <div class="section-header">
        <h2 class="h3">Historial Reciente</h2>
        <span class="exercise-badge" v-if="history.length > 0">{{ history.length }}</span>
      </div>
      
      <div v-if="history.length === 0" class="empty-state">
        <p>No hay entrenamientos completados.</p>
        <p class="text-muted" style="font-size: 0.875rem; margin: 0">Tu progreso aparecerá aquí</p>
      </div>
      
      <div v-else class="row-stack">
        <div 
          v-for="session in history" 
          :key="session.id" 
          class="card card-interactive history-card"
          @click="goToHistoryDetail(session.id)"
        >
          <div class="row-between">
            <div class="history-info">
              <h3 class="history-name">{{ session.name }}</h3>
              <p class="history-meta text-muted">
                {{ formatDate(session.endTime) }} • {{ session.exercises.length }} ejercicios
              </p>
            </div>
            <button 
              class="btn-icon danger" 
              @click.stop="confirmDelete(session.id)"
              title="Eliminar del historial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
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
const { workouts, startSession, exportWorkout, importWorkout } = useWorkouts()
const router = useRouter()

const fileInput = ref<HTMLInputElement | null>(null)

const handleExport = (id: string) => {
  exportWorkout(id)
}

const triggerImport = () => {
  fileInput.value?.click()
}

const handleFileImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const result = await importWorkout(file)
    alert(result.message) // Simple feedback for now
    target.value = '' // Reset input
  }
}


const startEmptyWorkout = () => {
  const sessionId = startSession()
  router.push(`/session/${sessionId}`)
}

const startWorkout = (workoutId: string) => {
  const sessionId = startSession(workoutId)
  router.push(`/session/${sessionId}`)
}

const getTotalSets = (workout: any) => {
  return workout.exercises.reduce((acc: number, ex: any) => acc + (ex.targetSets || 3), 0)
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
  workoutToDelete.value = null
}

const formatDate = (isoString: string) => {
  return new Date(isoString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goToHistoryDetail = (sessionId: string) => {
  router.push(`/history/${sessionId}`)
}
</script>

<style scoped>
.text-white {
  color: white;
}

.btn-hero {
  font-size: 1.1rem;
  padding: var(--spacing-lg);
}

.btn-hero svg {
  flex-shrink: 0;
}

/* Workout Cards */
.workout-card {
  padding: var(--spacing-md) var(--spacing-lg);
}

.workout-info {
  flex: 1;
  min-width: 0;
}

.workout-name {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
}

.workout-meta {
  margin: 0;
  font-size: 0.875rem;
}

.workout-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}


/* History Cards */
.history-card {
  padding: var(--spacing-md) var(--spacing-lg);
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-name {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
}

.history-meta {
  margin: 0;
  font-size: 0.85rem;
}
</style>
