import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Button } from "./button"
import { Trash2, Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface NoteCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  content: string
  date: string
  onDelete?: () => void
  onEdit?: () => void
}

export function NoteCard({
  title,
  content,
  date,
  onDelete,
  onEdit,
  className,
  ...props
}: NoteCardProps) {
  return (
    <Card
      className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-xl",
        className
      )}
      {...props}
    >
      <CardHeader className="relative">
        <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={onEdit}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="line-clamp-1">{title}</CardTitle>
        <CardDescription>{date}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm text-muted-foreground">{content}</p>
      </CardContent>
    </Card>
  )
}
