import { NextRequest } from 'next/server'
import { Signal } from '@/lib/types'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// In-memory subscribers (shared with signals API via global)
declare global {
    var sseSubscribers: Set<(signal: Signal) => void>
}

if (!global.sseSubscribers) {
    global.sseSubscribers = new Set()
}

// Server-Sent Events stream
export async function GET(request: NextRequest) {
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        start(controller) {
            // Send initial connection message
            controller.enqueue(encoder.encode('data: {"connected": true}\n\n'))

            // Create callback for this connection
            const callback = (signal: Signal) => {
                try {
                    const data = JSON.stringify(signal)
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                } catch (e) {
                    console.error('Stream error:', e)
                }
            }

            // Subscribe
            global.sseSubscribers.add(callback)

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
                global.sseSubscribers.delete(callback)
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
