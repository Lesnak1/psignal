import { Signal } from './types'
import fs from 'fs'
import path from 'path'

const SIGNALS_FILE = path.join(process.cwd(), 'data', 'signals.json')

// Ensure data directory exists
export function ensureDataDir() {
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
    }
    if (!fs.existsSync(SIGNALS_FILE)) {
        fs.writeFileSync(SIGNALS_FILE, JSON.stringify({ signals: [] }))
    }
}

export function getSignals(): Signal[] {
    try {
        ensureDataDir()
        const data = fs.readFileSync(SIGNALS_FILE, 'utf-8')
        return JSON.parse(data).signals || []
    } catch {
        return []
    }
}

export function addSignal(signal: Signal): void {
    ensureDataDir()
    const signals = getSignals()
    signals.unshift(signal) // Add to front

    // Keep last 100 signals
    const trimmed = signals.slice(0, 100)
    fs.writeFileSync(SIGNALS_FILE, JSON.stringify({ signals: trimmed }, null, 2))
}

// In-memory subscribers for SSE
const subscribers = new Set<(signal: Signal) => void>()

export function subscribe(callback: (signal: Signal) => void) {
    subscribers.add(callback)
    return () => subscribers.delete(callback)
}

export function broadcast(signal: Signal) {
    subscribers.forEach(callback => callback(signal))
}
