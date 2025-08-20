"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PDFUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PDFUploadDialog({ open, onOpenChange }: PDFUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setTitle(selectedFile.name.replace(".pdf", ""))
      setError("")
    } else {
      setError("Please select a valid PDF file")
      setFile(null)
    }
  }

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      setError("Please select a file and enter a title")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title.trim())

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { documentId } = await response.json()
        onOpenChange(false)
        router.push(`/tutor/${documentId}`)
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || "Upload failed")
      }
    } catch (error) {
      setError("An error occurred during upload")
    } finally {
      setIsUploading(false)
    }
  }

  const resetDialog = () => {
    setFile(null)
    setTitle("")
    setError("")
    setIsUploading(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen)
        if (!newOpen) resetDialog()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload PDF Document</DialogTitle>
          <DialogDescription>Upload a PDF document to start learning with AI assistance</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="file">PDF File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={isUploading}
                className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-primary file:text-primary-foreground"
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {file.name}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your document"
              disabled={isUploading}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!file || !title.trim() || isUploading} className="flex-1 gap-2">
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
