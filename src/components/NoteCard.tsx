import React from 'react'
import { Note } from '../types'

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  viewMode: 'grid' | 'list'
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete, viewMode }) => {
  return (
    <div
      className={`p-4 rounded-lg shadow-md transition-all hover:shadow-lg ${
        viewMode === 'grid' ? 'w-full' : 'w-full md:w-2/3'
      }`}
      style={{ backgroundColor: note.color }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{note.title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(note)}
            className="text-sm px-3 py-1 rounded bg-white bg-opacity-20 hover:bg-opacity-30"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="text-sm px-3 py-1 rounded bg-white bg-opacity-20 hover:bg-opacity-30"
          >
            Delete
          </button>
        </div>
      </div>

      <p className="text-gray-800 mb-3 whitespace-pre-wrap">{note.content}</p>

      <div className="flex flex-wrap gap-2 mt-4">
        {note.tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 text-sm rounded-full bg-white bg-opacity-30"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-700">
        <span>{note.category}</span>
        <span>{new Date(note.date).toLocaleDateString()}</span>
      </div>
    </div>
  )
}
