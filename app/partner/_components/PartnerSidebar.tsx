'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Supplier = {
  name: string
  category: string | string[] | null
  city: string | null
}

type Props = {
  supplier: Supplier
  pendingCount?: number
}

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { icon: '📊', label: 'Dashboard',  href: '/partner/dashboard' },
      { icon: '📅', label: 'Calendar',   href: '/partner/calendar' },
      { icon: '💬', label: 'Inquiries',  href: '/partner/inquiries', badge: true },
    ],
  },
  {
    label: 'My listing',
    items: [
      { icon: '🤹', label: 'Profile',    href: '/partner/profile' },
      { icon: '📸', label: 'Photos',     href: '/partner/photos' },
      { icon: '💲', label: 'Pricing',    href: '/partner/pricing' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { icon: '📈', label: 'Performance', href: '/partner/analytics' },
      { icon: '⭐', label: 'Reviews',     href: '/partner/reviews' },
      { icon: '💰', label: 'Earnings',    href: '/partner/earnings' },
    ],
  },
  {
    label: 'Account',
    items: [
      { icon: '⚙', label: 'Settings',   href: '/partner/settings' },
    ],
  },
]

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export default function PartnerSidebar({ supplier, pendingCount = 0 }: Props) {
  const pathname = usePathname()
  const supplierType = Array.isArray(supplier.category)
    ? supplier.category[0]
    : (supplier.category ?? 'Partner')

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col py-7" style={{ background: '#18160F' }}>
      <Link href="/" className="font-display text-[22px] font-bold text-white px-6 pb-7 tracking-[-0.5px] no-underline block">
        Fête<span className="text-gold">.</span>
      </Link>

      {NAV_GROUPS.map(group => (
        <div key={group.label}>
          <div className="text-[10px] font-semibold tracking-[0.1em] uppercase px-6 mb-2 mt-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {group.label}
          </div>
          {group.items.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2.5 px-6 py-[9px] text-[13px] no-underline border-l-2 transition-all ${
                  active ? 'text-white border-gold' : 'text-white/55 border-transparent hover:text-white/85'
                }`}
                style={active ? { background: 'rgba(255,255,255,0.07)' } : {}}
              >
                <span className="text-[15px] w-[18px] text-center">{item.icon}</span>
                {item.label}
                {item.badge && pendingCount > 0 && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-[1px] rounded-full bg-rose text-white">
                    {pendingCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      ))}

      <div className="mt-auto px-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-xs font-bold text-ink flex-shrink-0">
            {initials(supplier.name)}
          </div>
          <div>
            <div className="text-xs font-medium text-white">{supplier.name}</div>
            <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {supplierType} · {supplier.city}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
