"use client"

declare const SpeechRecognition: any

export class VoiceService {
  private recognition: any | null = null
  private synthesis: SpeechSynthesis | null = null
  private isSupported = false

  constructor() {
    if (typeof window !== "undefined") {
      // Check for speech recognition support
      this.recognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      if (this.recognition) {
        this.recognition.continuous = false
        this.recognition.interimResults = false
        this.recognition.lang = "en-US"
        this.isSupported = true
      }

      // Check for speech synthesis support
      if (window.speechSynthesis) {
        this.synthesis = window.speechSynthesis
      }
    }
  }

  isVoiceSupported(): boolean {
    return this.isSupported && !!this.synthesis
  }

  startListening(onResult: (transcript: string) => void, onError: (error: string) => void, onEnd: () => void): void {
    if (!this.recognition) {
      onError("Speech recognition not supported")
      return
    }

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
    }

    this.recognition.onerror = (event) => {
      onError(`Speech recognition error: ${event.error}`)
    }

    this.recognition.onend = () => {
      onEnd()
    }

    try {
      this.recognition.start()
    } catch (error) {
      onError("Failed to start speech recognition")
    }
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop()
    }
  }

  speak(text: string, onEnd?: () => void): void {
    if (!this.synthesis) {
      console.warn("Speech synthesis not supported")
      return
    }

    // Cancel any ongoing speech
    this.synthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    // Try to use a more natural voice
    const voices = this.synthesis.getVoices()
    const preferredVoice = voices.find(
      (voice) => voice.name.includes("Google") || voice.name.includes("Microsoft") || voice.lang.startsWith("en"),
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    if (onEnd) {
      utterance.onend = onEnd
    }

    this.synthesis.speak(utterance)
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel()
    }
  }

  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false
  }
}

export const voiceService = new VoiceService()
