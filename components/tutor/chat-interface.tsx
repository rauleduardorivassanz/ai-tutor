"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Mic, MicOff } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ChatInterfaceProps {
  documentId: string
  currentChat?: {
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
  }
  onPageChange: (page: number) => void
  onAnnotationAdd: (annotations: any[]) => void
}

export function ChatInterface({ documentId, currentChat, onPageChange, onAnnotationAdd }: ChatInterfaceProps) {
  const [messages, setMessages] = useState(currentChat?.messages || [])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      createdAt: new Date(),
      pageNumber: null,
      annotations: null,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          message: input.trim(),
          chatId: currentChat?.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const aiMessage = {
          id: data.messageId,
          content: data.content,
          role: "assistant",
          createdAt: new Date(),
          pageNumber: data.pageNumber,
          annotations: data.annotations,
        }

        setMessages((prev) => [...prev, aiMessage])

        // Handle page navigation and annotations
        if (data.pageNumber) {
          onPageChange(data.pageNumber)
        }
        if (data.annotations) {
          onAnnotationAdd(data.annotations)
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVoiceInput = () => {
    setIsListening(!isListening)
    // Voice input implementation would go here
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Chat Header */}
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold">AI Tutor Chat</h2>
        <p className="text-sm text-muted-foreground">Ask questions about your document</p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Start a conversation about your document</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Try asking:</p>
                <p>"What is this document about?"</p>
                <p>"Explain the main concepts"</p>
                <p>"Show me page 3"</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.pageNumber && (
                    <p className="text-xs mt-1 opacity-75">Referenced page {message.pageNumber}</p>
                  )}
                  <p className="text-xs mt-1 opacity-75">
                    {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">AI is thinking...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your document..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={toggleVoiceInput}
            className={isListening ? "bg-primary text-primary-foreground" : ""}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
