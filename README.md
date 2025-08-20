# AI Tutor Application

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/ameens-projects-f0034c3a/v0-no-content)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/w8xiHnF4FqQ)

## Overview

An intelligent AI tutor application that helps users understand PDF documents through interactive conversation and real-time visual annotations. Built with Next.js, featuring voice interaction, PDF annotation, and AI-powered document analysis.

## Features

- **Authentication System**: Secure user registration and login with NextAuth
- **PDF Upload & Viewer**: Split-screen interface with PDF display and chat
- **AI Chat Integration**: GPT-4o powered conversations about document content
- **Real-time Annotations**: AI-controlled highlighting and visual annotations
- **Voice Input/Output**: Speech-to-text input and text-to-speech responses
- **Responsive Design**: Mobile-first design with educational theme

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **AI**: OpenAI GPT-4o via AI SDK
- **PDF Processing**: PDF.js, Canvas API
- **Voice**: Web Speech API
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd ai-tutor-app
   npm install
   \`\`\`

2. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your environment variables:
   \`\`\`env
   DATABASE_URL="postgresql://username:password@localhost:5432/ai_tutor_db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-key-here"
   OPENAI_API_KEY="your-openai-api-key-here"
   \`\`\`

3. **Set up the database**
   \`\`\`bash
   npx prisma generate
   npx prisma db push
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open [http://localhost:3000](http://localhost:3000)**

## Usage

1. **Sign up** for a new account or **sign in**
2. **Upload a PDF** document from the dashboard
3. **Start chatting** with the AI about your document
4. **Use voice input** by clicking the microphone button
5. **View annotations** that the AI creates in real-time on the PDF

## API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/chat` - AI chat with document context
- `POST /api/documents/upload` - PDF document upload
- `GET /api/documents/[id]/content` - Extract PDF content

## Database Schema

- **User**: User accounts and authentication
- **Document**: Uploaded PDF documents
- **Chat**: Chat sessions between users and AI
- **Message**: Individual messages with annotations

## Deployment

Your project is live at:
**[https://vercel.com/ameens-projects-f0034c3a/v0-no-content](https://vercel.com/ameens-projects-f0034c3a/v0-no-content)**

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

## Development

Continue building your app on:
**[https://v0.app/chat/projects/w8xiHnF4FqQ](https://v0.app/chat/projects/w8xiHnF4FqQ)**

### Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   └── tutor/             # Tutor interface
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── tutor/             # Tutor interface components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
├── prisma/                # Database schema
└── scripts/               # Database scripts
\`\`\`

## Contributing

This project was built as a technical demonstration for StudyFetch. The application showcases advanced AI integration, real-time PDF annotation, and voice interaction capabilities.

## License

Built with [v0.app](https://v0.app) - AI-powered development platform.
