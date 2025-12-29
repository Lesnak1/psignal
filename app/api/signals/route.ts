import { NextRequest, NextResponse } from 'next/server'
import { getSignals, addSignal, broadcast } from '@/lib/signals'
import { Signal } from '@/lib/types'

// GET - Fetch all signals
export async function GET() {
    const signals = getSignals()
    return NextResponse.json({ signals })
}

// POST - Add new signal (from bot)
export async function POST(request: NextRequest) {
    try {
        const signal: Signal = await request.json()

        // Validate required fields
        if (!signal.market_id || !signal.trade_amount_usd) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Add timestamp if not present
        if (!signal.timestamp) {
            signal.timestamp = Math.floor(Date.now() / 1000)
        }
        if (!signal.detected_at) {
            signal.detected_at = new Date().toISOString()
        }

        // Store signal
        addSignal(signal)

        // Broadcast to SSE subscribers
        broadcast(signal)

        console.log(`📡 New signal received: ${signal.title || signal.event_slug}`)

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
