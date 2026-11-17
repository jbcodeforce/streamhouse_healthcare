import { request } from './client'

export interface ChatResponse {
  session_id: string
  message: string
  history: Array<{ role: string; content: string }>
}

export const getChatWelcome = () => request<{ role: string; content: string }>('/chat/welcome')
export const sendChatMessage = (sessionId: string, message: string) =>
  request<ChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, message }),
  })
export const resetChatSession = (sessionId: string) =>
  request<{ reset: boolean }>(`/chat/reset/${sessionId}`, { method: 'POST' })
