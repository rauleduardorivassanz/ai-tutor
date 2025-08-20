"use client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MousePointer, Highlighter, Circle, Square, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AnnotationToolbarProps {
  selectedTool: "select" | "highlight" | "circle" | "rectangle"
  onToolChange: (tool: "select" | "highlight" | "circle" | "rectangle") => void
  onClearAnnotations: () => void
  annotationCount: number
}

export function AnnotationToolbar({
  selectedTool,
  onToolChange,
  onClearAnnotations,
  annotationCount,
}: AnnotationToolbarProps) {
  const tools = [
    { id: "select" as const, icon: MousePointer, label: "Select", color: "default" },
    { id: "highlight" as const, icon: Highlighter, label: "Highlight", color: "secondary" },
    { id: "circle" as const, icon: Circle, label: "Circle", color: "secondary" },
    { id: "rectangle" as const, icon: Square, label: "Rectangle", color: "secondary" },
  ]

  return (
    <div className="border-b bg-card px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Annotation Tools:</span>

        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={selectedTool === tool.id ? "default" : "outline"}
            size="sm"
            onClick={() => onToolChange(tool.id)}
            className="gap-2"
          >
            <tool.icon className="h-4 w-4" />
            {tool.label}
          </Button>
        ))}

        <Separator orientation="vertical" className="h-6" />

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {annotationCount} annotation{annotationCount !== 1 ? "s" : ""}
          </Badge>

          {annotationCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAnnotations}
              className="gap-2 text-destructive hover:text-destructive bg-transparent"
            >
              <Trash2 className="h-4 w-4" />
              Clear Page
            </Button>
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Click and drag to create annotations • AI annotations appear automatically
      </div>
    </div>
  )
}
