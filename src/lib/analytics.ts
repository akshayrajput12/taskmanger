import { Task } from '../types'

export const getTaskAnalytics = (tasks: Task[]) => {
  const now = new Date()
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(date.getDate() + i)
    return date.toISOString().split('T')[0]
  })

  // Tasks by priority
  const tasksByPriority = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  }

  // Tasks by completion status
  const tasksByStatus = {
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
  }

  // Tasks completed per day
  const tasksPerDay = last7Days.map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    completed: tasks.filter(t => t.completedAt?.split('T')[0] === date).length,
    created: tasks.filter(t => t.startTime?.split('T')[0] === date).length,
  }))

  // Time remaining distribution
  const timeDistribution = tasks
    .filter(t => t.timeRemaining && t.timeRemaining > 0)
    .map(t => ({
      name: t.title,
      value: t.timeRemaining,
    }))

  return {
    tasksByPriority,
    tasksByStatus,
    tasksPerDay,
    timeDistribution,
  }
}

export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export const formatTimeRemaining = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  return `${hours}h ${minutes}m ${remainingSeconds}s`
}
