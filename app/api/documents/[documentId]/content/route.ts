import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { extractPDFText } from "@/lib/pdf-processor"
import { join } from "path"

export async function GET(request: NextRequest, { params }: { params: { documentId: string } }) {
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

    const document = await prisma.document.findFirst({
      where: {
        id: params.documentId,
        userId: user.id,
      },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Extract PDF content
    const filePath = join(process.cwd(), "public", document.fileUrl)
    const pdfContent = await extractPDFText(filePath)

    return NextResponse.json({
      document: {
        id: document.id,
        title: document.title,
        totalPages: pdfContent.totalPages,
      },
      content: pdfContent,
    })
  } catch (error) {
    console.error("PDF content extraction error:", error)
    return NextResponse.json({ error: "Failed to extract PDF content" }, { status: 500 })
  }
}
