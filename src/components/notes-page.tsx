import * as React from "react"
import { Button } from "./ui/button"
import { NoteCard } from "./ui/note-card"
import { NoteDialog } from "./ui/note-dialog"
import { PlusCircle } from "lucide-react"

interface Note {
  id: string
  title: string
  content: string
  date: string
}

export function NotesPage() {
  const [notes, setNotes] = React.useState<Note[]>(() => {
    const savedNotes = localStorage.getItem("notes")
    return savedNotes ? JSON.parse(savedNotes) : []
  })
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingNote, setEditingNote] = React.useState<Note | null>(null)

  React.useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes))
  }, [notes])

  const handleCreateNote = ({ title, content }: { title: string; content: string }) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      date: new Date().toLocaleDateString(),
    }
    setNotes((prev) => [newNote, ...prev])
  }

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setDialogOpen(true)
  }

  const handleUpdateNote = ({ title, content }: { title: string; content: string }) => {
    if (!editingNote) return
    setNotes((prev) =>
      prev.map((note) =>
        note.id === editingNote.id
          ? { ...note, title, content, date: new Date().toLocaleDateString() }
          : note
      )
    )
    setEditingNote(null)
  }

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Notes</h1>
        <Button
          onClick={() => {
            setEditingNote(null)
            setDialogOpen(true)
          }}
          className="gap-2 transition-all duration-300 hover:scale-[1.02]"
        >
          <PlusCircle className="h-5 w-5" />
          Create Note
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            title={note.title}
            content={note.content}
            date={note.date}
            onEdit={() => handleEditNote(note)}
            onDelete={() => handleDeleteNote(note.id)}
            className="transform transition-all duration-300 hover:scale-[1.02]"
          />
        ))}
      </div>

      <NoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={editingNote ? handleUpdateNote : handleCreateNote}
        initialNote={editingNote || undefined}
        mode={editingNote ? "edit" : "create"}
      />

      {notes.length === 0 && (
        <div className="mt-8 text-center text-muted-foreground">
          <p>No notes yet. Create your first note!</p>
        </div>
      )}
    </div>
  )
}
