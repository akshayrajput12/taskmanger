import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { Button } from "./button"
import { Input } from "./input"
import { Textarea } from "./textarea"
import { Label } from "./label"

interface NoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (note: { title: string; content: string }) => void
  initialNote?: { title: string; content: string }
  mode?: "create" | "edit"
}

export function NoteDialog({
  open,
  onOpenChange,
  onSave,
  initialNote,
  mode = "create",
}: NoteDialogProps) {
  const [title, setTitle] = React.useState(initialNote?.title || "")
  const [content, setContent] = React.useState(initialNote?.content || "")

  React.useEffect(() => {
    if (open) {
      setTitle(initialNote?.title || "")
      setContent(initialNote?.content || "")
    }
  }, [open, initialNote])

  const handleSave = () => {
    onSave({ title, content })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create Note" : "Edit Note"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new note with a title and content."
              : "Edit your note details below."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="transition-all duration-300 focus-visible:ring-2"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] resize-none transition-all duration-300 focus-visible:ring-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSave}
            className="transition-all duration-300 hover:scale-[1.02]"
            disabled={!title.trim() || !content.trim()}
          >
            {mode === "create" ? "Create Note" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
