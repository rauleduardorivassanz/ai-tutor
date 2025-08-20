import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { documentId, message, chatId } = await request.json()

    // Get document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: user.id,
      },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Get or create chat
    let chat
    if (chatId) {
      chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          userId: user.id,
          documentId,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 10, // Last 10 messages for context
          },
        },
      })
    }

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
          userId: user.id,
          documentId,
        },
        include: {
          messages: true,
        },
      })
    }

    // Save user message
    await prisma.message.create({
      data: {
        content: message,
        role: "user",
        chatId: chat.id,
      },
    })

    // Prepare context for AI
    const conversationHistory = chat.messages
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n")

    const systemPrompt = `You are an AI tutor helping students understand PDF documents. You have access to a document titled "${document.title}".

Key capabilities:
1. Answer questions about the document content
2. Navigate to specific pages by responding with page numbers
3. Highlight important sections by providing annotation coordinates
4. Provide educational explanations and insights

ANNOTATION INSTRUCTIONS:
When you want to create visual annotations, use these formats:
- For page navigation: "PAGE_REFERENCE: X" where X is the page number
- For highlighting text: "ANNOTATION: {type: 'highlight', x: 20, y: 30, width: 60, height: 8, color: '#fbbf24'}"
- For circling content: "ANNOTATION: {type: 'circle', x: 40, y: 50, width: 20, height: 20, color: '#dc2626'}"
- For rectangles: "ANNOTATION: {type: 'rectangle', x: 10, y: 25, width: 80, height: 15, color: '#dc2626'}"

Coordinates are percentages (0-100) relative to the page.

Previous conversation:
${conversationHistory}

Current question: ${message}

Provide a helpful, educational response. When appropriate, create visual annotations to highlight important content. Always explain what you're highlighting and why it's important.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: systemPrompt,
      maxTokens: 500,
    })

    // Parse AI response for special commands
    let pageNumber = null
    let annotations = null
    let cleanedResponse = text

    // Extract page reference
    const pageMatch = text.match(/PAGE_REFERENCE:\s*(\d+)/i)
    if (pageMatch) {
      pageNumber = Number.parseInt(pageMatch[1])
      cleanedResponse = cleanedResponse.replace(/PAGE_REFERENCE:\s*\d+/gi, "").trim()
    }

    // Extract annotations
    const annotationMatches = text.match(/ANNOTATION:\s*({[^}]+})/gi)
    if (annotationMatches) {
      annotations = []
      for (const match of annotationMatches) {
        try {
          const annotationData = JSON.parse(match.replace(/ANNOTATION:\s*/i, ""))
          annotations.push(annotationData)
          cleanedResponse = cleanedResponse.replace(match, "").trim()
        } catch (e) {
          console.error("Failed to parse annotation:", e)
        }
      }
    }

    // Save AI message
    const aiMessage = await prisma.message.create({
      data: {
        content: cleanedResponse,
        role: "assistant",
        chatId: chat.id,
        pageNumber,
        annotations: annotations ? JSON.stringify(annotations) : null,
      },
    })

    return NextResponse.json({
      messageId: aiMessage.id,
      content: cleanedResponse,
      pageNumber,
      annotations,
      chatId: chat.id,
    })
  } catch (error) {
    console.error("Chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
