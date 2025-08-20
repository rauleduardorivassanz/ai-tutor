import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TutorInterface } from "@/components/tutor/tutor-interface"

interface TutorPageProps {
  params: {
    documentId: string
  }
}

export default async function TutorPage({ params }: TutorPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    redirect("/auth/signin")
  }

  const document = await prisma.document.findFirst({
    where: {
      id: params.documentId,
      userId: user.id,
    },
    include: {
      chats: {
        orderBy: { updatedAt: "desc" },
        take: 1,
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  })

  if (!document) {
    redirect("/dashboard")
  }

  return <TutorInterface document={document} user={user} />
}
