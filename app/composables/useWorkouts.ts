export const useWorkouts = () => {
    // State (persisted in localStorage would be ideal, but using useState for Nuxt reactivity)
    // In a real app, use useStorage or pinia-plugin-persistedstate
    // For this v1 local-first, we'll try to sync with localStorage in onMounted if possible

    const workouts = useState<any[]>('workouts', () => [])
    const history = useState<any[]>('history', () => [])
    const activeSession = useState<any>('activeSession', () => null)

    // Load from localsotrage on client init
    if (import.meta.client) {
        const savedWorkouts = localStorage.getItem('gym-workouts')
        if (savedWorkouts) workouts.value = JSON.parse(savedWorkouts)

        const savedHistory = localStorage.getItem('gym-history')
        if (savedHistory) history.value = JSON.parse(savedHistory)
    }

    // Save changes watcher
    watch(workouts, (newVal) => {
        if (import.meta.client) localStorage.setItem('gym-workouts', JSON.stringify(newVal))
    }, { deep: true })

    watch(history, (newVal) => {
        if (import.meta.client) localStorage.setItem('gym-history', JSON.stringify(newVal))
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

    const startSession = (workoutId?: string) => {
        let sessionBase = {
            id: crypto.randomUUID(),
            startTime: new Date().toISOString(),
            currentExerciseIndex: 0,
            exercises: [],
            name: 'Entrenamiento Libre'
        }

        if (workoutId) {
            const workout = workouts.value.find(w => w.id === workoutId)
            if (workout) {
                sessionBase.name = workout.name
                // Clone exercises structure
                sessionBase.exercises = workout.exercises.map((e: any) => ({
                    ...e,
                    sets: [] // Empty sets for the session
                }))
            }
        }

        activeSession.value = sessionBase
        return sessionBase.id
    }

    const finishSession = () => {
        if (!activeSession.value) return

        const completedSession = {
            ...activeSession.value,
            endTime: new Date().toISOString()
        }

        history.value.unshift(completedSession) // Add to top of history
        activeSession.value = null
    }


    const deleteSession = (sessionId: string) => {
        history.value = history.value.filter(s => s.id !== sessionId)
    }

    const deleteWorkout = (workoutId: string) => {
        workouts.value = workouts.value.filter(w => w.id !== workoutId)
    }

    const exportWorkout = (workoutId: string) => {
        const workout = workouts.value.find(w => w.id === workoutId)
        if (!workout) return

        const exportData = {
            version: 1,
            type: 'gym-tracker-routine',
            name: workout.name,
            exercises: workout.exercises.map((e: any) => ({
                name: e.name,
                targetSets: e.targetSets,
                targetReps: e.targetReps,
                targetWeight: e.targetWeight,
                notes: e.notes || ''
            })),
            exportedAt: new Date().toISOString()
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${workout.name.toLowerCase().replace(/\s+/g, '-')}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const importWorkout = (file: File): Promise<{ success: boolean; message: string }> => {
        return new Promise((resolve) => {
            const reader = new FileReader()

            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string
                    const data = JSON.parse(content)

                    if (data.type !== 'gym-tracker-routine' || !data.name || !data.exercises) {
                        resolve({ success: false, message: 'Formato de archivo inválido' })
                        return
                    }

                    const newWorkout = {
                        id: crypto.randomUUID(),
                        name: data.name,
                        exercises: data.exercises.map((e: any) => ({
                            name: e.name || '',
                            targetSets: e.targetSets || 3,
                            targetReps: e.targetReps || 10,
                            targetWeight: e.targetWeight || 0,
                            notes: e.notes || ''
                        })),
                        createdAt: new Date().toISOString()
                    }

                    workouts.value.push(newWorkout)
                    resolve({ success: true, message: `Rutina "${data.name}" importada!` })
                } catch (error) {
                    resolve({ success: false, message: 'Error al procesar el archivo' })
                }
            }

            reader.onerror = () => resolve({ success: false, message: 'Error al leer el archivo' })
            reader.readAsText(file)
        })
    }

    return {
        workouts,
        history,
        activeSession,
        createWorkout,
        startSession,
        finishSession,
        deleteSession,
        deleteWorkout,
        exportWorkout,
        importWorkout
    }
}
