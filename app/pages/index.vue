<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-section mb-8">
      <h1 class="mb-4">Tu Training <span class="text-white">Tracker</span></h1>
      
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
          <span class="exercise-badge" v-if="workouts.length > 0">{{ workouts.length }}</span>
        </div>
      </div>
      
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

              <!-- More Options Menu -->
              <div class="options-menu-container">
                <button
                  class="btn-icon"
                  @click.stop="toggleOptionsMenu(workout.id)"
                  title="Más opciones"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                  </svg>
                </button>

                <div v-if="openMenuId === workout.id" class="options-menu card">
                  <button
                    class="btn-menu-item"
                    @click.stop="shareWorkout(workout.id)"
                  >
                    Compartir
                  </button>
                  <button
                    class="btn-menu-item danger"
                    @click.stop="confirmDeleteWorkout(workout.id)"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
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
const { workouts, startSession, shareWorkout } = useWorkouts()
const router = useRouter()

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
const openMenuId = ref<string | null>(null)
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

const toggleOptionsMenu = (workoutId: string) => {
  if (openMenuId.value === workoutId) {
    openMenuId.value = null
  } else {
    openMenuId.value = workoutId
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.options-menu-container')) {
    openMenuId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const confirmDeleteWorkout = (workoutId: string) => {
  openMenuId.value = null // Close menu
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

.options-menu-container {
  position: relative;
}

.options-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--spacing-xs);
  padding: var(--spacing-xs);
  min-width: 120px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.btn-menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background-color: transparent;
  color: var(--color-text);
  font-size: 0.9rem;
  text-align: left;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.btn-menu-item:hover {
  background-color: var(--color-background-muted);
}

.btn-menu-item.danger {
  color: var(--color-danger);
}

.btn-menu-item.danger:hover {
  background-color: var(--color-danger-muted);
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
