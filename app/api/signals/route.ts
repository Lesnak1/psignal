import { NextRequest, NextResponse } from 'next/server'
import { Signal } from '@/lib/types'

// In-memory storage (Vercel serverless)
let signals: Signal[] = []

// SSE subscribers (global for sharing with stream route)
declare global {
    var sseSubscribers: Set<(signal: Signal) => void>
}

if (!global.sseSubscribers) {
    global.sseSubscribers = new Set()
}

// GET - Fetch all signals
export async function GET() {
    return NextResponse.json({ signals })
}

// POST - Add new signal (from bot)
export async function POST(request: NextRequest) {
    try {
        const signal: Signal = await request.json()

        // Validate required fields
        if (!signal.trade_amount_usd || signal.trade_amount_usd <= 0) {
            return NextResponse.json(
                { error: 'Invalid trade amount' },
                { status: 400 }
            )
        }

        // Ensure valid data
        signal.timestamp = signal.timestamp || Math.floor(Date.now() / 1000)
        signal.detected_at = signal.detected_at || new Date().toISOString()
        signal.title = signal.title || signal.event_slug || 'Unknown Market'
        signal.trade_side = signal.trade_side || 'BUY'
        signal.price_move_pct = signal.price_move_pct || 0
        signal.price_before = signal.price_before || 0
        signal.price_after = signal.price_after || 0

        // Store signal (keep last 50)
        signals.unshift(signal)
        signals = signals.slice(0, 50)

        // Broadcast to SSE subscribers
        global.sseSubscribers.forEach(callback => {
            try {
                callback(signal)
            } catch (e) {
                console.error('SSE broadcast error:', e)
            }
        })

        console.log(`📡 New signal: ${signal.title} - $${signal.trade_amount_usd}`)

        return NextResponse.json({
            success: true,
            message: 'Signal received',
            signal
        })
    } catch (error) {
        console.error('Error processing signal:', error)
        return NextResponse.json(
            { error: 'Failed to process signal' },
            { status: 500 }
        )
    }
}

// DELETE - Clear all signals
export async function DELETE() {
    signals = []
    return NextResponse.json({ success: true, message: 'Signals cleared' })
}

