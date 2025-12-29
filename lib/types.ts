export interface Signal {
    market_id: string
    condition_id?: string
    event_slug: string
    title: string
    trade_side: string
    trade_amount_usd: number
    trade_size: number
    trade_price: number
    price_before: number
    price_after: number
    price_move_pct: number
    timestamp: number
    detected_at: string
    confidence: 'high' | 'medium' | 'low'
    trader_address?: string
    filters?: FilterResult[]
}

export interface FilterResult {
    name: string
    passed: boolean
    reason: string
}

export interface PnLData {
    totalSignals: number
    wins: number
    losses: number
    avgMove: number
    totalVolume: number
}
