import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">AI Tutor</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Interactive AI tutor that helps you understand PDF documents through intelligent conversation and real-time
            annotations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Smart Document Analysis</CardTitle>
              <CardDescription>
                Upload your PDFs and get instant AI-powered insights with highlighted annotations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Voice Interaction</CardTitle>
              <CardDescription>
                Chat with your documents using text or voice for a natural learning experience
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center space-x-4">
          <Button asChild size="lg">
            <Link href="/auth/signup">Get Started</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
