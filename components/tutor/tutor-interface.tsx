"use client"
import { useState } from "react"
import { PDFViewer } from "./pdf-viewer"
import { EnhancedChatInterface } from "./enhanced-chat-interface"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Menu, Brain } from "lucide-react"
import Link from "next/link"
import type { Annotation } from "./pdf-viewer"

interface TutorInterfaceProps {
  document: {
    id: string
    title: string
    filename: string
    fileUrl: string
    chats: Array<{
      id: string
      title: string | null
      messages: Array<{
        id: string
        content: string
        role: string
        createdAt: Date
        pageNumber: number | null
        annotations: any
      }>
    }>
  }
  user: {
    id: string
    name: string | null
    email: string
  }
}

export function TutorInterface({ document, user }: TutorInterfaceProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const currentChat = document.chats[0]

  const handleAnnotationAdd = (newAnnotations: Annotation[]) => {
    setAnnotations((prev) => [...prev, ...newAnnotations])
  }

  const handleAnnotationsChange = (updatedAnnotations: Annotation[]) => {
    setAnnotations(updatedAnnotations)
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <h1 className="font-semibold text-lg truncate">{document.title}</h1>
              <p className="text-sm text-muted-foreground">AI Tutor Session</p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer with Enhanced Annotations */}
        <div className={`flex-1 ${isMobileMenuOpen ? "hidden md:block" : ""}`}>
          <PDFViewer
            fileUrl={document.fileUrl}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            annotations={annotations}
            onAnnotationsChange={handleAnnotationsChange}
          />
        </div>

        {/* Enhanced Chat Interface */}
        <div className={`w-full md:w-96 border-l ${!isMobileMenuOpen ? "hidden md:block" : ""}`}>
          <EnhancedChatInterface
            documentId={document.id}
            currentChat={currentChat}
            onPageChange={setCurrentPage}
            onAnnotationAdd={handleAnnotationAdd}
          />
        </div>
      </div>
    </div>
  )
}
