'use client'

import { Signal } from '@/lib/types'

interface SignalCardProps {
    signal: Signal
    isNew?: boolean
}

export default function SignalCard({ signal, isNew }: SignalCardProps) {
    const isPositive = signal.price_move_pct > 0
    const confidence = signal.confidence || 'medium'

    const confidenceColors = {
        high: 'border-green-500/50 whale-glow',
        medium: 'border-yellow-500/30',
        low: 'border-gray-500/30',
    }

    const formatTime = (ts: number) => {
        const date = new Date(ts * 1000)
        return date.toLocaleTimeString()
    }

    const formatMoney = (amount: number) => {
        if (amount === undefined || amount === null) return '$0'
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
        if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
        return `$${amount.toFixed(0)}`
    }

    return (
        <div className={`
      bg-[#111] border rounded-xl p-5 transition-all duration-300
      ${confidenceColors[confidence]}
      ${isNew ? 'animate-slide-in' : ''}
    `}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">🐋</span>
                        <h3 className="font-semibold text-lg truncate max-w-md">
                            {signal.title || signal.event_slug}
                        </h3>
                    </div>
                    <p className="text-gray-400 text-sm">
                        {formatTime(signal.timestamp)}
                    </p>
                </div>

                <div className={`
          px-3 py-1 rounded-full text-sm font-medium
          ${confidence === 'high' ? 'bg-green-500/20 text-green-400' : ''}
          ${confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : ''}
          ${confidence === 'low' ? 'bg-gray-500/20 text-gray-400' : ''}
        `}>
                    {confidence.toUpperCase()}
                </div>
            </div>

            {/* Trade Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                    <p className="text-gray-500 text-xs mb-1">Trade Size</p>
                    <p className="text-xl font-bold text-white">
                        {formatMoney(signal.trade_amount_usd)}
                    </p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs mb-1">Side</p>
                    <p className={`text-xl font-bold ${signal.trade_side === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                        {signal.trade_side}
                    </p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs mb-1">Price</p>
                    <p className="text-lg">
                        <span className="text-gray-400">${signal.price_before?.toFixed(3)}</span>
                        <span className="text-gray-600 mx-1">→</span>
                        <span className="text-white">${signal.price_after?.toFixed(3)}</span>
                    </p>
                </div>
                <div>
                    <p className="text-gray-500 text-xs mb-1">Impact</p>
                    <p className={`text-xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '↑' : '↓'} {(Math.abs(signal.price_move_pct) * 100).toFixed(1)}%
                    </p>
                </div>
            </div>

            {/* Filters */}
            {signal.filters && (
                <div className="border-t border-gray-800 pt-3 mt-3">
                    <p className="text-gray-500 text-xs mb-2">Filter Results</p>
                    <div className="flex flex-wrap gap-2">
                        {signal.filters.map((f, i) => (
                            <span
                                key={i}
                                className={`
                  px-2 py-1 rounded text-xs
                  ${f.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
                `}
                            >
                                {f.passed ? '✓' : '✗'} {f.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Market Link */}
            {signal.event_slug && (
                <div className="border-t border-gray-800 pt-3 mt-3">
                    <a
                        href={`https://polymarket.com/event/${signal.event_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg text-sm transition-colors"
                    >
                        🔗 View on Polymarket
                        <span className="text-xs opacity-70">↗</span>
                    </a>
                </div>
            )}
        </div>
    )
}
