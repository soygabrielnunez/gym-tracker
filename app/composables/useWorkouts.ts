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

    return {
        workouts,
        history,
        activeSession,
        createWorkout,
        startSession,
        finishSession,
        deleteSession,
        deleteWorkout
    }
}
