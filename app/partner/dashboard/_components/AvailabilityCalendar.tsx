'use client'

import { useState, useTransition } from 'react'

type Props = {
  supplierId: string
  initialBlockedDates: string[]   // 'YYYY-MM-DD'
  bookedDates: string[]           // 'YYYY-MM-DD' — confirmed/completed bookings
}

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function AvailabilityCalendar({ supplierId, initialBlockedDates, bookedDates }: Props) {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [blocked, setBlocked] = useState<Set<string>>(new Set(initialBlockedDates))
  const [isPending, startTransition] = useTransition()

  const booked = new Set(bookedDates)

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function toggleDate(key: string) {
    if (booked.has(key)) return   // can't unblock a confirmed booking
    startTransition(async () => {
      const isBlocked = blocked.has(key)
      // Optimistic update
      setBlocked(prev => {
        const next = new Set(prev)
        isBlocked ? next.delete(key) : next.add(key)
        return next
      })
      // Persist
      await fetch('/api/availability', {
        method: isBlocked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierId, date: key }),
      })
    })
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay()   // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate())

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold text-ink">📅 Availability calendar</div>
          <div className="text-[11px] text-ink3 mt-0.5">Click any date to block or unblock it</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-xs text-ink2 hover:bg-warm cursor-pointer bg-white">‹</button>
          <span className="text-[13px] font-semibold text-ink min-w-[120px] text-center">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-xs text-ink2 hover:bg-warm cursor-pointer bg-white">›</button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-[9px] font-semibold text-ink3 text-center py-1">{d}</div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className={`grid grid-cols-7 gap-1 transition-opacity ${isPending ? 'opacity-60' : 'opacity-100'}`}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const key = toKey(year, month, day)
          const isBooked   = booked.has(key)
          const isBlocked  = blocked.has(key)
          const isToday    = key === todayKey
          const isPast     = key < todayKey

          let cellClass = 'relative flex flex-col items-center justify-start pt-1 rounded-lg min-h-[32px] text-[11px] font-medium transition-colors '
          let numClass = ''

          if (isBooked) {
            cellClass += 'bg-teal-lt border border-teal cursor-default'
            numClass = 'text-teal font-semibold'
          } else if (isBlocked) {
            cellClass += 'bg-rose-lt border border-rose cursor-pointer hover:opacity-80'
            numClass = 'text-rose'
          } else if (isToday) {
            cellClass += 'bg-ink cursor-pointer'
            numClass = 'text-white font-semibold'
          } else if (isPast) {
            cellClass += 'opacity-40 cursor-default'
            numClass = 'text-ink3'
          } else {
            cellClass += 'hover:bg-warm cursor-pointer border border-transparent hover:border-border'
            numClass = 'text-ink2'
          }

          return (
            <div
              key={key}
              className={cellClass}
              onClick={() => !isPast && !isBooked && toggleDate(key)}
              title={isBooked ? 'Confirmed booking' : isBlocked ? 'Blocked — click to unblock' : 'Available — click to block'}
            >
              <span className={numClass}>{day}</span>
              {isBooked  && <div className="w-1 h-1 rounded-full bg-teal mt-0.5" />}
              {isBlocked && <div className="w-1 h-1 rounded-full bg-rose mt-0.5" />}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 pt-3 border-t border-border">
        {[
          { dot: 'bg-teal',  label: 'Booked' },
          { dot: 'bg-rose',  label: 'Blocked' },
          { dot: 'bg-ink',   label: 'Today' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-ink3">
            <div className={`w-2 h-2 rounded-sm ${l.dot}`} />
            {l.label}
          </div>
        ))}
        {isPending && <div className="ml-auto text-[10px] text-ink3">Saving…</div>}
      </div>
    </div>
  )
}
