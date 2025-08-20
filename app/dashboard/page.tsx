import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      documents: {
        orderBy: { uploadedAt: "desc" },
        include: {
          chats: {
            orderBy: { updatedAt: "desc" },
            take: 1,
          },
        },
      },
    },
  })

  if (!user) {
    redirect("/auth/signin")
  }

  return <DashboardContent user={user} />
}
