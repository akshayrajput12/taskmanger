import React from 'react'
import { useDrag } from 'react-dnd'
import { Task } from '../types'
import { formatTimeRemaining } from '../lib/analytics'

interface TaskCardProps {
  task: Task
  index: number
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string) => void
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  index,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { type: 'TASK', id: task.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  }

  return (
    <div
      ref={drag}
      className={`p-4 mb-4 bg-white rounded-lg shadow-md transition-all ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </h3>
        <span className={`px-2 py-1 rounded-full text-sm ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      
      <p className="text-gray-600 mb-3">{task.description}</p>
      
      {task.timeRemaining && task.timeRemaining > 0 && (
        <div className="text-sm text-gray-500 mb-2">
          Time remaining: {formatTimeRemaining(task.timeRemaining)}
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="flex space-x-2">
          <button
            onClick={() => onToggleComplete(task.id)}
            className="text-sm px-3 py-1 rounded bg-green-100 text-green-800 hover:bg-green-200"
          >
            {task.completed ? 'Undo' : 'Complete'}
          </button>
          <button
            onClick={() => onEdit(task)}
            className="text-sm px-3 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-sm px-3 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200"
          >
            Delete
          </button>
        </div>
        <span className="text-sm text-gray-500">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}
