"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, MessageSquare } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Annotation } from "./pdf-viewer"

interface AnnotationOverlayProps {
  annotations: Annotation[]
  currentAnnotation: Partial<Annotation> | null
  onDeleteAnnotation: (id: string) => void
  zoom: number
}

export function AnnotationOverlay({
  annotations,
  currentAnnotation,
  onDeleteAnnotation,
  zoom,
}: AnnotationOverlayProps) {
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null)

  const getAnnotationStyle = (annotation: Partial<Annotation>) => {
    const baseStyle = {
      position: "absolute" as const,
      left: `${annotation.x}%`,
      top: `${annotation.y}%`,
      width: `${annotation.width}%`,
      height: `${annotation.height}%`,
      pointerEvents: "auto" as const,
    }

    switch (annotation.type) {
      case "highlight":
        return {
          ...baseStyle,
          backgroundColor: `${annotation.color}40`, // 25% opacity
          border: `2px solid ${annotation.color}`,
          borderRadius: "4px",
        }
      case "circle":
        return {
          ...baseStyle,
          border: `3px solid ${annotation.color}`,
          borderRadius: "50%",
          backgroundColor: "transparent",
        }
      case "rectangle":
        return {
          ...baseStyle,
          border: `3px solid ${annotation.color}`,
          borderRadius: "4px",
          backgroundColor: "transparent",
        }
      default:
        return baseStyle
    }
  }

  const getAnnotationClasses = (annotation: Partial<Annotation>) => {
    const baseClasses = "transition-all duration-200"

    if (annotation.createdBy === "ai") {
      return `${baseClasses} animate-pulse`
    }

    return baseClasses
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <TooltipProvider>
        {/* Existing annotations */}
        {annotations.map((annotation) => (
          <div key={annotation.id} className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  style={getAnnotationStyle(annotation)}
                  className={getAnnotationClasses(annotation)}
                  onMouseEnter={() => setHoveredAnnotation(annotation.id)}
                  onMouseLeave={() => setHoveredAnnotation(null)}
                />
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <p className="font-medium">{annotation.createdBy === "ai" ? "AI Annotation" : "Your Annotation"}</p>
                  <p className="text-xs text-muted-foreground">
                    {annotation.type} • {annotation.timestamp.toLocaleTimeString()}
                  </p>
                  {annotation.text && <p className="text-xs mt-1">{annotation.text}</p>}
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Delete button for user annotations */}
            {hoveredAnnotation === annotation.id && annotation.createdBy === "user" && (
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                style={{
                  left: `${annotation.x + annotation.width}%`,
                  top: `${annotation.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={() => onDeleteAnnotation(annotation.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}

            {/* AI annotation indicator */}
            {annotation.createdBy === "ai" && (
              <div
                className="absolute flex items-center justify-center"
                style={{
                  left: `${annotation.x + annotation.width}%`,
                  top: `${annotation.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="bg-primary text-primary-foreground rounded-full p-1">
                  <MessageSquare className="h-3 w-3" />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Current annotation being drawn */}
        {currentAnnotation && (
          <div style={getAnnotationStyle(currentAnnotation)} className="border-dashed opacity-70" />
        )}
      </TooltipProvider>
    </div>
  )
}
