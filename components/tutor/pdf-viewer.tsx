"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { AnnotationOverlay } from "./annotation-overlay"
import { AnnotationToolbar } from "./annotation-toolbar"

export interface Annotation {
  id: string
  type: "highlight" | "circle" | "rectangle" | "arrow"
  x: number // percentage
  y: number // percentage
  width: number // percentage
  height: number // percentage
  color: string
  text?: string
  createdBy: "user" | "ai"
  timestamp: Date
}

interface PDFViewerProps {
  fileUrl: string
  currentPage: number
  onPageChange: (page: number) => void
  annotations: Annotation[]
  onAnnotationsChange?: (annotations: Annotation[]) => void
}

export function PDFViewer({ fileUrl, currentPage, onPageChange, annotations, onAnnotationsChange }: PDFViewerProps) {
  const [numPages, setNumPages] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTool, setSelectedTool] = useState<"select" | "highlight" | "circle" | "rectangle">("select")
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentAnnotation, setCurrentAnnotation] = useState<Partial<Annotation> | null>(null)
  const [pageAnnotations, setPageAnnotations] = useState<Annotation[]>([])

  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Filter annotations for current page
  useEffect(() => {
    const filtered = annotations.filter((ann) => ann.id.startsWith(`page-${currentPage}-`) || !ann.id.includes("page-"))
    setPageAnnotations(filtered)
  }, [annotations, currentPage])

  useEffect(() => {
    setIsLoading(false)
    setNumPages(10) // Placeholder - would be determined by actual PDF
  }, [fileUrl])

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < numPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.25, 0.5))
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (selectedTool === "select") return

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      const newAnnotation: Partial<Annotation> = {
        id: `page-${currentPage}-${Date.now()}`,
        type: selectedTool as "highlight" | "circle" | "rectangle",
        x,
        y,
        width: 0,
        height: 0,
        color: selectedTool === "highlight" ? "#fbbf24" : "#dc2626",
        createdBy: "user",
        timestamp: new Date(),
      }

      setCurrentAnnotation(newAnnotation)
      setIsDrawing(true)
    },
    [selectedTool, currentPage],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing || !currentAnnotation) return

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const currentX = ((e.clientX - rect.left) / rect.width) * 100
      const currentY = ((e.clientY - rect.top) / rect.height) * 100

      const width = Math.abs(currentX - currentAnnotation.x!)
      const height = Math.abs(currentY - currentAnnotation.y!)
      const x = Math.min(currentX, currentAnnotation.x!)
      const y = Math.min(currentY, currentAnnotation.y!)

      setCurrentAnnotation({
        ...currentAnnotation,
        x,
        y,
        width,
        height,
      })
    },
    [isDrawing, currentAnnotation],
  )

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentAnnotation) return

    // Only save annotation if it has meaningful size
    if (currentAnnotation.width! > 1 && currentAnnotation.height! > 1) {
      const newAnnotation = currentAnnotation as Annotation
      const updatedAnnotations = [...annotations, newAnnotation]
      onAnnotationsChange?.(updatedAnnotations)
    }

    setIsDrawing(false)
    setCurrentAnnotation(null)
  }, [isDrawing, currentAnnotation, annotations, onAnnotationsChange])

  const handleDeleteAnnotation = (annotationId: string) => {
    const updatedAnnotations = annotations.filter((ann) => ann.id !== annotationId)
    onAnnotationsChange?.(updatedAnnotations)
  }

  const handleClearAnnotations = () => {
    const updatedAnnotations = annotations.filter((ann) => !ann.id.startsWith(`page-${currentPage}-`))
    onAnnotationsChange?.(updatedAnnotations)
  }

  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* PDF Controls */}
      <div className="border-b bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage} of {numPages}
          </span>
          <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage >= numPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 3}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Annotation Toolbar */}
      <AnnotationToolbar
        selectedTool={selectedTool}
        onToolChange={setSelectedTool}
        onClearAnnotations={handleClearAnnotations}
        annotationCount={pageAnnotations.length}
      />

      {/* PDF Display */}
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-96 bg-card rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading PDF...</p>
              </div>
            </div>
          ) : (
            <div
              className="relative cursor-crosshair"
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {/* PDF Iframe */}
              <iframe
                ref={iframeRef}
                src={`${fileUrl}#page=${currentPage}&zoom=${zoom * 100}`}
                className="w-full h-[800px] border rounded-lg shadow-sm pointer-events-none"
                title="PDF Viewer"
              />

              {/* Annotation Overlay */}
              <AnnotationOverlay
                annotations={pageAnnotations}
                currentAnnotation={currentAnnotation}
                onDeleteAnnotation={handleDeleteAnnotation}
                zoom={zoom}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
