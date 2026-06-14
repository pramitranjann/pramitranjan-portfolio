'use client'

import { useEffect, useRef, useState } from 'react'

interface SpeechRecognitionResultLike {
  isFinal: boolean
  0: { transcript: string }
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

interface SpeechRecognitionErrorEventLike extends Event {
  error?: string
}

interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onend: (() => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  abort?(): void
  start(): void
  stop(): void
}

function getSpeechErrorMessage(error?: string) {
  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Safari blocked speech recognition. Reopen the page in Safari, allow mic access, and try again.'
    case 'audio-capture':
      return 'Safari could not access the microphone. Check Safari site settings and iPhone microphone permissions.'
    case 'network':
      return 'Speech recognition hit a network error. Try again on a stronger connection.'
    case 'no-speech':
      return 'No speech was detected. Try again and speak right after tapping the button.'
    case 'aborted':
      return 'Voice capture stopped before transcription finished.'
    default:
      return 'Voice capture failed. If Safari keeps rejecting it, use the keyboard mic in the textarea.'
  }
}

function extractSaveCommand(value: string) {
  const normalized = value.trim().replace(/\s+/g, ' ')
  const commandPattern = /\b(?:save entry|save note|save this entry|save this note)\b[.!?]*$/i
  if (!commandPattern.test(normalized)) {
    return { content: normalized, shouldSubmit: false }
  }

  return {
    content: normalized.replace(commandPattern, '').trim(),
    shouldSubmit: true,
  }
}

export function VoiceCaptureControl({
  textareaId,
  sourceInputId,
}: {
  textareaId: string
  sourceInputId: string
}) {
  const [mounted, setMounted] = useState(false)
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const [hint, setHint] = useState('Voice capture requires the page to finish loading in Safari.')
  const [error, setError] = useState<string | null>(null)
  const [interimTranscript, setInterimTranscript] = useState('')
  const recognitionConstructorRef = useRef<(new () => SpeechRecognitionLike) | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const finalTranscriptRef = useRef('')
  const interimTranscriptRef = useRef('')
  const pendingSubmitRef = useRef(false)
  const stoppingRef = useRef(false)

  function setTextareaValue(content: string) {
    const textareaElement = document.getElementById(textareaId) as HTMLTextAreaElement | null
    if (textareaElement) {
      textareaElement.value = content
    }
  }

  function setVoiceSource() {
    const sourceInput = document.getElementById(sourceInputId) as HTMLInputElement | null
    if (sourceInput) {
      sourceInput.value = 'voice'
    }
  }

  function getCombinedTranscript() {
    return [finalTranscriptRef.current, interimTranscriptRef.current].filter(Boolean).join(' ').trim()
  }

  function handlePotentialSaveCommand(transcript: string) {
    const parsed = extractSaveCommand(transcript)
    if (!parsed.content && !parsed.shouldSubmit) {
      return false
    }

    finalTranscriptRef.current = parsed.content
    interimTranscriptRef.current = ''
    setTextareaValue(parsed.content)
    setVoiceSource()

    if (!parsed.shouldSubmit || pendingSubmitRef.current) {
      return false
    }

    if (!parsed.content) {
      setError('Dictate some content before saying save entry.')
      return true
    }

    pendingSubmitRef.current = true
    forceStopRecognition()
    return true
  }

  function destroyRecognition(recognition?: SpeechRecognitionLike | null) {
    if (!recognition) {
      return
    }

    recognition.onend = null
    recognition.onerror = null
    recognition.onresult = null

    if (recognitionRef.current === recognition) {
      recognitionRef.current = null
    }
  }

  function forceStopRecognition() {
    const recognition = recognitionRef.current
    if (!recognition) {
      return
    }

    stoppingRef.current = true

    if (typeof recognition.abort === 'function') {
      recognition.abort()
      return
    }

    recognition.stop()
  }

  useEffect(() => {
    setMounted(true)

    const speechWindow = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionLike
      webkitSpeechRecognition?: new () => SpeechRecognitionLike
    }
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition
    if (!Recognition) {
      setHint(
        window.isSecureContext
          ? 'Safari did not expose speech recognition here. Use the keyboard mic in the textarea instead.'
          : 'Voice capture requires HTTPS. Open the deployed site in Safari.',
      )
      return
    }

    recognitionConstructorRef.current = Recognition
    setSupported(true)
    setHint('Tap once, allow microphone access if Safari asks, then speak. Say save entry to submit by voice.')

    const handlePageHide = () => {
      setListening(false)
      forceStopRecognition()
    }

    document.addEventListener('visibilitychange', handlePageHide)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      document.removeEventListener('visibilitychange', handlePageHide)
      window.removeEventListener('pagehide', handlePageHide)
      forceStopRecognition()
      destroyRecognition(recognitionRef.current)
    }
  }, [sourceInputId, textareaId])

  async function toggleListening() {
    const Recognition = recognitionConstructorRef.current
    if (!Recognition) {
      setError('Voice capture is unavailable in this browser context. Use the keyboard mic in the textarea.')
      return
    }

    setError(null)

    if (listening) {
      setListening(false)
      pendingSubmitRef.current = false
      forceStopRecognition()
      return
    }

    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement | null
    finalTranscriptRef.current = textarea?.value.trim() || ''
    interimTranscriptRef.current = ''
    setInterimTranscript('')
    pendingSubmitRef.current = false
    stoppingRef.current = false

    destroyRecognition(recognitionRef.current)

    const recognition = new Recognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.onresult = (event) => {
      let finalText = ''
      let interimText = ''

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index]
        const transcript = result[0].transcript
        if (result.isFinal) {
          finalText += transcript
        } else {
          interimText += transcript
        }
      }

      if (finalText) {
        finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalText}`.trim()
        if (handlePotentialSaveCommand(getCombinedTranscript())) {
          return
        }
      }

      interimTranscriptRef.current = interimText.trim()

      if (handlePotentialSaveCommand(getCombinedTranscript())) {
        setInterimTranscript('')
        return
      }

      setTextareaValue(getCombinedTranscript())
      setVoiceSource()
      setInterimTranscript(interimTranscriptRef.current)
    }
    recognition.onerror = (event) => {
      const wasStopping = stoppingRef.current
      setListening(false)
      interimTranscriptRef.current = ''
      setInterimTranscript('')

      if (!(wasStopping && event.error === 'aborted')) {
        setError(getSpeechErrorMessage(event.error))
      }
    }
    recognition.onend = () => {
      if (!pendingSubmitRef.current) {
        handlePotentialSaveCommand(getCombinedTranscript())
      }

      const shouldSubmit = pendingSubmitRef.current
      const textareaElement = document.getElementById(textareaId) as HTMLTextAreaElement | null
      const form = textareaElement?.form

      setListening(false)
      interimTranscriptRef.current = ''
      setInterimTranscript('')
      pendingSubmitRef.current = false
      stoppingRef.current = false
      destroyRecognition(recognition)

      if (shouldSubmit && form) {
        form.requestSubmit()
      }
    }

    recognitionRef.current = recognition

    try {
      setVoiceSource()
      recognition.start()
      setListening(true)
    } catch (startError) {
      setListening(false)
      destroyRecognition(recognition)
      setError(startError instanceof Error ? startError.message : 'Voice capture failed to start.')
    }
  }

  return (
    <>
      <button
        className={`mic-button ${listening ? 'is-live' : ''}`}
        disabled={!mounted || !supported}
        onClick={toggleListening}
        type="button"
      >
        {listening
          ? 'Stop listening'
          : !mounted
            ? 'Loading voice capture'
            : supported
              ? 'Start voice capture'
              : 'Voice unavailable'}
      </button>
      <p className="muted-text">
        {!mounted
          ? 'Voice capture loads after the page JS starts. If it does not, use the keyboard mic in the textarea.'
          : hint}
      </p>
      {interimTranscript ? <div className="interim-chip">Live: {interimTranscript}</div> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </>
  )
}
