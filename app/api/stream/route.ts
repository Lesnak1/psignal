import { NextRequest } from 'next/server'
import { subscribe } from '@/lib/signals'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Server-Sent Events stream
export async function GET(request: NextRequest) {
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        start(controller) {
            // Send initial connection message
            controller.enqueue(encoder.encode('data: {"connected": true}\n\n'))

            // Subscribe to new signals
            const unsubscribe = subscribe((signal) => {
                try {
                    const data = JSON.stringify(signal)
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                } catch (e) {
                    console.error('Stream error:', e)
                }
            })

            // Keep connection alive with heartbeat
            const heartbeat = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(': heartbeat\n\n'))
                } catch {
                    clearInterval(heartbeat)
                }
            }, 30000)

            // Cleanup on close
            request.signal.addEventListener('abort', () => {
                clearInterval(heartbeat)
                unsubscribe()
            })
        },
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    })
}
