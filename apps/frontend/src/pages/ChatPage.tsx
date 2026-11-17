import React, { useEffect, useState, useRef } from 'react'
import { getChatWelcome, sendChatMessage, resetChatSession } from '../api/chat'
import { Send, RotateCcw, Bot, User } from 'lucide-react'

export const ChatPage: React.FC = () => {
  const [sessionId] = useState(() => `session-${Math.random().toString(36).substring(2, 9)}`)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getChatWelcome()
      .then((welcome) => {
        setMessages([welcome])
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input
    if (!text.trim() || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const res = await sendChatMessage(sessionId, text)
      setMessages(res.history)
    } catch (err) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Apologies, I encountered an error connecting to the clinical context engine.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    await resetChatSession(sessionId)
    const welcome = await getChatWelcome()
    setMessages([welcome])
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>AI Clinical Assistant</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Natural language patient vitals and alert triage powered by Agno and the Real-Time Context Engine (RTCE).
          </p>
        </div>
        <button className="btn btn-secondary" onClick={handleReset}>
          <RotateCcw size={16} /> Reset Conversation
        </button>
      </div>

      <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem' }}>
          {messages.map((m, idx) => {
            const isUser = m.role === 'user'
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={18} color="#2563eb" />
                  </div>
                )}

                <div
                  style={{
                    background: isUser ? 'var(--accent)' : '#f1f5f9',
                    color: isUser ? '#ffffff' : 'var(--text-primary)',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.content}
                </div>

                {isUser && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <User size={18} color="#ffffff" />
                  </div>
                )}
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            onClick={() => handleSend('What is Alice Smith P001 current vitals and risk status?')}
          >
            "Status for P001 Alice Smith"
          </button>
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            onClick={() => handleSend('Are there any active clinical alerts or emergency button presses?')}
          >
            "Active Clinical Alerts?"
          </button>
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            onClick={() => handleSend('What is the prescription target for Lindsay Lee P004?')}
          >
            "Prescription for Lindsay Lee"
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <input
            type="text"
            style={{
              flex: 1,
              padding: '0.625rem 0.875rem',
              border: '1px solid var(--border-color)',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
            }}
            placeholder="Ask a clinical question about patients, vitals, or alerts..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button className="btn btn-primary" type="submit" disabled={loading || !input.trim()}>
            <Send size={16} /> Send
          </button>
        </form>
      </div>
    </div>
  )
}
