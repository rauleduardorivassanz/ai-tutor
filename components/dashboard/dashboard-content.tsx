"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, MessageSquare, Plus } from "lucide-react"
import { PDFUploadDialog } from "./pdf-upload-dialog"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface DashboardContentProps {
  user: {
    id: string
    name: string | null
    email: string
    documents: Array<{
      id: string
      title: string
      filename: string
      uploadedAt: Date
      chats: Array<{
        id: string
        title: string | null
        updatedAt: Date
      }>
    }>
  }
}

export function DashboardContent({ user }: DashboardContentProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">AI Tutor Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.name || user.email}</p>
            </div>
            <Button onClick={() => setUploadDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Upload PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {user.documents.length === 0 ? (
          <div className="text-center py-12">
            <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No documents yet</h2>
            <p className="text-muted-foreground mb-6">Upload your first PDF to start learning with AI</p>
            <Button onClick={() => setUploadDialogOpen(true)} size="lg" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Your First PDF
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {user.documents.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <FileText className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{document.title}</CardTitle>
                      <CardDescription className="text-sm">
                        Uploaded {formatDistanceToNow(document.uploadedAt, { addSuffix: true })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      {document.chats.length} chat{document.chats.length !== 1 ? "s" : ""}
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/tutor/${document.id}`}>Open</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <PDFUploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />
    </div>
  )
}
