<template>
  <div class="container">
    <header class="section-header mb-6">
      <div class="header-left">
        <NuxtLink to="/" class="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          VOLVER
        </NuxtLink>
      </div>
    </header>

    <div class="mb-8">
      <h1 class="page-title mb-2">Historial</h1>
      <p class="text-muted">Todos tus entrenamientos completados</p>
    </div>

    <div v-if="history.length === 0" class="empty-state">
      <p>No hay entrenamientos completados.</p>
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
                {{ formatHistoryDate(session.endTime) }} • {{ calculateDuration(session.startTime, session.endTime) }} • {{ session.exercises.length }} ejercicios
              </p>
            </div>
            <button 
              class="btn-icon danger" 
              @click.stop="confirmDelete(session.id)"
              title="Eliminar del historial"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
    </div>

    <ConfirmModal 
        :show="showDeleteModal"
        title="¿Eliminar historial?"
        message="Se eliminará este registro de entrenamiento permanentemente."
        @confirm="handleDelete"
        @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.locale('es')
dayjs.extend(isToday)
dayjs.extend(isYesterday)
dayjs.extend(relativeTime)

const { history, deleteSession } = useWorkouts()
const router = useRouter()

const showDeleteModal = ref(false)
const sessionToDelete = ref<string | null>(null)

const goToHistoryDetail = (sessionId: string) => {
  router.push(`/history/${sessionId}`)
}

const confirmDelete = (sessionId: string) => {
  sessionToDelete.value = sessionId
  showDeleteModal.value = true
}

const handleDelete = () => {
  if (sessionToDelete.value) {
    deleteSession(sessionToDelete.value)
    showDeleteModal.value = false
    sessionToDelete.value = null
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  sessionToDelete.value = null
}

const formatHistoryDate = (isoString: string) => {
  if (!isoString) return ''
  const date = dayjs(isoString)
  if (date.isToday()) return 'Hoy'
  if (date.isYesterday()) return 'Ayer'
  return date.format('D MMM YYYY')
}

const calculateDuration = (start: string, end: string) => {
  if (!start || !end) return ''
  const diff = dayjs(end).diff(dayjs(start), 'minute')
  if (diff >= 60) {
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    return `${hours}h ${minutes}m`
  }
  return `${diff}m`
}
</script>

<style scoped>

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
  color: var(--color-text);
}

.history-meta {
  margin: 0;
  font-size: 0.85rem;
}
</style>
