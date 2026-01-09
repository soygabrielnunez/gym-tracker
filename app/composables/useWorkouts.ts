import { onMounted } from 'vue'

export const useWorkouts = () => {
    const workouts = useState<any[]>('workouts', () => [])
    const history = useState<any[]>('history', () => [])
    const activeSession = useState<any>('activeSession', () => null)

    // Load from localStorage on client init
    onMounted(() => {
        // Workouts
        const savedWorkouts = localStorage.getItem('gym-workouts')
        if (savedWorkouts) workouts.value = JSON.parse(savedWorkouts)

        // History
        const savedHistory = localStorage.getItem('gym-history')
        if (savedHistory) history.value = JSON.parse(savedHistory)

        // Active Session (with migration for sessionNotes)
        const savedSession = localStorage.getItem('gym-active-session')
        if (savedSession) {
            const session = JSON.parse(savedSession)
            // MIGRATION: Ensure sessionNotes exist on exercises
            if (session.exercises && session.exercises.length > 0) {
                session.exercises.forEach((ex: any) => {
                    if (ex.sessionNotes === undefined) {
                        ex.sessionNotes = ''
                    }
                })
            }
            activeSession.value = session
        }
    })

    // Save changes watcher
    watch(workouts, (newVal) => {
        if (import.meta.client) localStorage.setItem('gym-workouts', JSON.stringify(newVal))
    }, { deep: true })

    watch(history, (newVal) => {
        if (import.meta.client) localStorage.setItem('gym-history', JSON.stringify(newVal))
    }, { deep: true })

    watch(activeSession, (newVal) => {
        if (import.meta.client) {
            if (newVal) {
                localStorage.setItem('gym-active-session', JSON.stringify(newVal))
            } else {
                localStorage.removeItem('gym-active-session')
            }
        }
    }, { deep: true })

    const createWorkout = (name: string, exercises: any[]) => {
        const newWorkout = {
            id: crypto.randomUUID(),
            name,
            exercises,
            createdAt: new Date().toISOString()
        }
        workouts.value.push(newWorkout)
        return newWorkout.id
    }

    const updateWorkout = (workoutId: string, updatedData: any) => {
        const workoutIndex = workouts.value.findIndex(w => w.id === workoutId)
        if (workoutIndex !== -1) {
            workouts.value[workoutIndex] = {
                ...workouts.value[workoutIndex],
                ...updatedData,
                updatedAt: new Date().toISOString()
            }
        }
    }

    const startSession = (workoutId: string) => {
        let sessionBase: any = {
            id: crypto.randomUUID(),
            startTime: new Date().toISOString(),
            currentExerciseIndex: 0,
            exercises: [],
            name: 'Entrenamiento'
        }

        const workout = workouts.value.find(w => w.id === workoutId)
        if (workout) {
            sessionBase.name = workout.name
            // Clone exercises structure
            sessionBase.exercises = workout.exercises.map((e: any) => ({
                ...e,
                sets: [], // Empty sets for the session
                sessionNotes: '' // Initialize sessionNotes
            }))
        }

        activeSession.value = sessionBase
        return sessionBase.id
    }

    const finishSession = () => {
        if (!activeSession.value) return

        // Check if any sets were recorded
        const hasRecordedSets = activeSession.value.exercises.some((e: any) => e.sets && e.sets.length > 0)

        if (hasRecordedSets) {
            const completedSession = {
                ...activeSession.value,
                endTime: new Date().toISOString()
            }
            history.value.unshift(completedSession) // Add to top of history
        }

        activeSession.value = null
    }

    const cancelSession = () => {
        activeSession.value = null
    }


    const deleteSession = (sessionId: string) => {
        history.value = history.value.filter(s => s.id !== sessionId)
    }

    const deleteWorkout = (workoutId: string) => {
        workouts.value = workouts.value.filter(w => w.id !== workoutId)
    }

    // ... (shareWorkout and importWorkoutFromData remain the same)
    const shareWorkout = (workoutId: string) => {
        const workout = workouts.value.find(w => w.id === workoutId)
        if (!workout) return

        const exportData = {
            type: 'gym-tracker-routine',
            name: workout.name,
            exercises: workout.exercises.map((e: any) => ({
                name: e.name,
                targetSets: e.targetSets,
                targetReps: e.targetReps,
                targetWeight: e.targetWeight,
                notes: e.notes || ''
            }))
        }

        const jsonString = JSON.stringify(exportData)
        const encodedData = btoa(jsonString)
        const url = `${window.location.origin}/import/${encodedData}`

        navigator.clipboard.writeText(url).then(() => {
            alert('¡Enlace para compartir copiado al portapeles!')
        }).catch(err => {
            console.error('Error al copiar el enlace: ', err)
            alert('No se pudo copiar el enlace. Inténtalo de nuevo.')
        })
    }

    const importWorkoutFromData = (workoutData: any) => {
        if (!workoutData || !workoutData.name || !workoutData.exercises) {
            console.error('Datos de la rutina para importar son inválidos')
            return
        }

        const newWorkout = {
            id: crypto.randomUUID(),
            name: workoutData.name,
            exercises: workoutData.exercises.map((e: any) => ({
                name: e.name || '',
                targetSets: e.targetSets || 3,
                targetReps: e.targetReps || 10,
                targetWeight: e.targetWeight || 0,
                notes: e.notes || ''
            })),
            createdAt: new Date().toISOString()
        }

        workouts.value.push(newWorkout)
    }


    return {
        workouts,
        history,
        activeSession,
        createWorkout,
        updateWorkout,
        startSession,
        finishSession,
        cancelSession,
        deleteSession,
        deleteWorkout,
        shareWorkout,
        importWorkoutFromData
    }
}
