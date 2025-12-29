'use client'

import { useState, useEffect } from 'react'
import SignalCard from '@/components/SignalCard'
import PnLTracker from '@/components/PnLTracker'
import { Signal } from '@/lib/types'

export default function Dashboard() {
    const [signals, setSignals] = useState<Signal[]>([])
    const [loading, setLoading] = useState(true)
    const [connected, setConnected] = useState(false)

    // Fetch initial signals
    useEffect(() => {
        fetch('/api/signals')
            .then(res => res.json())
            .then(data => {
                setSignals(data.signals || [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    // Subscribe to real-time updates
    useEffect(() => {
        const eventSource = new EventSource('/api/stream')

        eventSource.onopen = () => setConnected(true)
        eventSource.onerror = () => setConnected(false)

        eventSource.onmessage = (event) => {
            try {
                const newSignal = JSON.parse(event.data)
                setSignals(prev => [newSignal, ...prev].slice(0, 50))
            } catch (e) {
                console.error('Parse error:', e)
            }
        }

        return () => eventSource.close()
    }, [])

    // Calculate P&L
    const pnlData = {
        totalSignals: signals.length,
        wins: signals.filter(s => s.price_move_pct > 0).length,
        losses: signals.filter(s => s.price_move_pct < 0).length,
        avgMove: signals.length > 0
            ? signals.reduce((sum, s) => sum + Math.abs(s.price_move_pct || 0), 0) / signals.length
            : 0,
        totalVolume: signals.reduce((sum, s) => sum + (s.trade_amount_usd || 0), 0),
    }

    return (
        <main className="min-h-screen p-6">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text">🐋 PolySignal</h1>
                        <p className="text-gray-400 mt-1">Whale Trade Detection Dashboard</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                            {connected ? 'Live' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            </header>

            {/* P&L Stats */}
            <PnLTracker {...pnlData} />

            {/* Signal Feed */}
            <section className="mt-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <span>📡 Live Signals</span>
                    <span className="text-sm text-gray-500 font-normal">({signals.length})</span>
                </h2>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : signals.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p className="text-5xl mb-4">🐋</p>
                        <p>Waiting for whale signals...</p>
                        <p className="text-sm mt-2">Signals will appear here when $50K+ trades are detected</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {signals.map((signal, i) => (
                            <SignalCard key={signal.timestamp + i} signal={signal} isNew={i === 0} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}
