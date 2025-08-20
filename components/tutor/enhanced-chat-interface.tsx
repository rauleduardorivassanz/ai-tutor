"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Mic, MicOff, BookOpen, Lightbulb, Highlighter, Volume2, VolumeX } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Annotation } from "./pdf-viewer"
import { voiceService } from "@/lib/voice-service"

interface EnhancedChatInterfaceProps {
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
  onAnnotationAdd: (annotations: Annotation[]) => void
}

export function EnhancedChatInterface({
  documentId,
  currentChat,
  onPageChange,
  onAnnotationAdd,
}: EnhancedChatInterfaceProps) {
  const [messages, setMessages] = useState(currentChat?.messages || [])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [chatId, setChatId] = useState(currentChat?.id)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    setVoiceSupported(voiceService.isVoiceSupported())
  }, [])

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
    const currentInput = input.trim()
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          message: currentInput,
          chatId,
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
        setChatId(data.chatId)

        if (voiceSupported && data.content) {
          setIsSpeaking(true)
          voiceService.speak(data.content, () => {
            setIsSpeaking(false)
          })
        }

        if (data.pageNumber) {
          onPageChange(data.pageNumber)
        }
        if (data.annotations && data.annotations.length > 0) {
          const formattedAnnotations: Annotation[] = data.annotations.map((ann: any, index: number) => ({
            id: `ai-${data.messageId}-${index}`,
            type: ann.type || "highlight",
            x: ann.x || 0,
            y: ann.y || 0,
            width: ann.width || 10,
            height: ann.height || 5,
            color: ann.color || "#dc2626",
            text: data.content.slice(0, 100),
            createdBy: "ai" as const,
            timestamp: new Date(),
          }))
          onAnnotationAdd(formattedAnnotations)
        }
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage = {
        id: Date.now().toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        createdAt: new Date(),
        pageNumber: null,
        annotations: null,
      }
      setMessages((prev) => [...prev, errorMessage])
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
    if (!voiceSupported) {
      alert("Voice input is not supported in your browser")
      return
    }

    if (isListening) {
      voiceService.stopListening()
      setIsListening(false)
    } else {
      setIsListening(true)
      voiceService.startListening(
        (transcript) => {
          setInput(transcript)
          setIsListening(false)
        },
        (error) => {
          console.error("Voice input error:", error)
          setIsListening(false)
          alert("Voice input failed. Please try again.")
        },
        () => {
          setIsListening(false)
        },
      )
    }
  }

  const toggleSpeech = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking()
      setIsSpeaking(false)
    } else {
      const lastAiMessage = [...messages].reverse().find((msg) => msg.role === "assistant")
      if (lastAiMessage) {
        setIsSpeaking(true)
        voiceService.speak(lastAiMessage.content, () => setIsSpeaking(false))
      }
    }
  }

  const handleQuickQuestion = (question: string) => {
    setInput(question)
  }

  const quickQuestions = [
    "What is this document about?",
    "Highlight the main concepts on this page",
    "Show me the key points",
    "Circle important diagrams",
  ]

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="font-semibold flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          AI Tutor Chat
          {voiceSupported && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Voice Enabled</span>
          )}
        </h2>
        <p className="text-sm text-muted-foreground">Ask questions and get visual annotations</p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-muted-foreground mb-6">Start a conversation about your document</p>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground mb-3">Try asking:</p>
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion(question)}
                    className="block w-full text-left justify-start"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>

                  {message.role === "assistant" && (message.pageNumber || message.annotations || voiceSupported) && (
                    <div className="mt-3 pt-2 border-t border-current/20 flex gap-2 flex-wrap">
                      {message.pageNumber && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPageChange(message.pageNumber!)}
                          className="text-xs h-auto p-2 text-current hover:bg-current/10"
                        >
                          📄 Go to page {message.pageNumber}
                        </Button>
                      )}
                      {message.annotations && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-auto p-2 text-current hover:bg-current/10 gap-1"
                        >
                          <Highlighter className="h-3 w-3" />
                          Annotations added
                        </Button>
                      )}
                      {voiceSupported && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsSpeaking(true)
                            voiceService.speak(message.content, () => setIsSpeaking(false))
                          }}
                          className="text-xs h-auto p-2 text-current hover:bg-current/10 gap-1"
                        >
                          <Volume2 className="h-3 w-3" />
                          Speak
                        </Button>
                      )}
                    </div>
                  )}

                  <p className="text-xs mt-2 opacity-75">
                    {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted border rounded-lg px-4 py-3 max-w-[85%]">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">AI is analyzing and annotating...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? "Listening..." : "Ask a question to get visual annotations..."}
            disabled={isLoading || isListening}
            className="flex-1"
          />
          {voiceSupported && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleVoiceInput}
              className={isListening ? "bg-primary text-primary-foreground animate-pulse" : ""}
              title={isListening ? "Stop listening" : "Start voice input"}
              disabled={isLoading}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          {voiceSupported && (
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSpeech}
              className={isSpeaking ? "bg-secondary text-secondary-foreground" : ""}
              title={isSpeaking ? "Stop speaking" : "Speak last response"}
              disabled={isLoading || messages.filter((m) => m.role === "assistant").length === 0}
            >
              {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          )}
          <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {isListening && (
          <div className="mt-2 text-center">
            <span className="text-xs text-primary animate-pulse">🎤 Listening... Speak now</span>
          </div>
        )}
      </div>
    </div>
  )
}
