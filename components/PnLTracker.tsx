'use client'

interface PnLTrackerProps {
    totalSignals: number
    wins: number
    losses: number
    avgMove: number
    totalVolume: number
}

export default function PnLTracker({
    totalSignals,
    wins,
    losses,
    avgMove,
    totalVolume,
}: PnLTrackerProps) {
    const winRate = totalSignals > 0 ? (wins / totalSignals) * 100 : 0

    const formatMoney = (amount: number) => {
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
        if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
        return `$${amount.toFixed(0)}`
    }

    const stats = [
        {
            label: 'Total Signals',
            value: totalSignals,
            icon: '📊',
            color: 'text-primary',
        },
        {
            label: 'Win Rate',
            value: `${winRate.toFixed(0)}%`,
            icon: '🎯',
            color: winRate >= 50 ? 'text-green-400' : 'text-yellow-400',
            subtext: `${wins}W / ${losses}L`,
        },
        {
            label: 'Avg Impact',
            value: `${(avgMove * 100).toFixed(1)}%`,
            icon: '📈',
            color: 'text-blue-400',
        },
        {
            label: 'Total Volume',
            value: formatMoney(totalVolume),
            icon: '💰',
            color: 'text-green-400',
        },
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <div
                    key={i}
                    className="bg-[#111] border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{stat.icon}</span>
                        <span className="text-gray-400 text-sm">{stat.label}</span>
                    </div>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                    </p>
                    {stat.subtext && (
                        <p className="text-gray-500 text-sm mt-1">{stat.subtext}</p>
                    )}
                </div>
            ))}
        </div>
    )
}
