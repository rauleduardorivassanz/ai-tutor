-- Initialize the AI Tutor database
-- This script creates the necessary tables and indexes for the application

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (handled by Prisma, but included for reference)
-- CREATE TABLE IF NOT EXISTS "User" (
--   "id" TEXT NOT NULL PRIMARY KEY,
--   "email" TEXT NOT NULL UNIQUE,
--   "password" TEXT NOT NULL,
--   "name" TEXT,
--   "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   "updatedAt" TIMESTAMP(3) NOT NULL
-- );

-- Documents table (handled by Prisma, but included for reference)
-- CREATE TABLE IF NOT EXISTS "Document" (
--   "id" TEXT NOT NULL PRIMARY KEY,
--   "title" TEXT NOT NULL,
--   "filename" TEXT NOT NULL,
--   "fileUrl" TEXT NOT NULL,
--   "fileSize" INTEGER NOT NULL,
--   "pageCount" INTEGER,
--   "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   "userId" TEXT NOT NULL,
--   FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
-- );

-- Chats table (handled by Prisma, but included for reference)
-- CREATE TABLE IF NOT EXISTS "Chat" (
--   "id" TEXT NOT NULL PRIMARY KEY,
--   "title" TEXT,
--   "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   "updatedAt" TIMESTAMP(3) NOT NULL,
--   "userId" TEXT NOT NULL,
--   "documentId" TEXT NOT NULL,
--   FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
--   FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE
-- );

-- Messages table (handled by Prisma, but included for reference)
-- CREATE TABLE IF NOT EXISTS "Message" (
--   "id" TEXT NOT NULL PRIMARY KEY,
--   "content" TEXT NOT NULL,
--   "role" TEXT NOT NULL,
--   "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--   "pageNumber" INTEGER,
--   "annotations" JSONB,
--   "chatId" TEXT NOT NULL,
--   FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE
-- );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "Document_userId_idx" ON "Document"("userId");
CREATE INDEX IF NOT EXISTS "Chat_userId_idx" ON "Chat"("userId");
CREATE INDEX IF NOT EXISTS "Chat_documentId_idx" ON "Chat"("documentId");
CREATE INDEX IF NOT EXISTS "Message_chatId_idx" ON "Message"("chatId");
CREATE INDEX IF NOT EXISTS "Message_createdAt_idx" ON "Message"("createdAt");

-- Insert sample data for testing (optional)
-- Note: This would typically be done through the application interface
-- INSERT INTO "User" ("id", "email", "password", "name") VALUES 
-- ('test-user-1', 'demo@studyfetch.com', '$2a$10$example-hashed-password', 'Demo User')
-- ON CONFLICT ("email") DO NOTHING;

COMMENT ON TABLE "User" IS 'User accounts for the AI tutor application';
COMMENT ON TABLE "Document" IS 'PDF documents uploaded by users for tutoring';
COMMENT ON TABLE "Chat" IS 'Chat sessions between users and the AI tutor';
COMMENT ON TABLE "Message" IS 'Individual messages in chat sessions with AI responses and annotations';
