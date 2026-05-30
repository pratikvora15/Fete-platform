'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'

/* ── types ── */
type PartnerType = 'entertainer' | 'food' | 'venue' | 'games' | 'other' | null
type Step = 1 | 2 | 3 | 4 | 'success'

/* ── static data ── */
const PARTNER_TYPES = [
  { id: 'entertainer', icon: '🎩', name: 'Entertainer', sub: 'Magicians, fire performers, comedians, face painters, balloon artists, DJs, bands', count: '340+ listed' },
  { id: 'food',        icon: '🍽', name: 'Food supplier', sub: 'Caterers, cake designers, food trucks, dessert bars, halal & dietary specialists', count: '210+ listed' },
  { id: 'venue',       icon: '🏛', name: 'Venue', sub: 'Event halls, rooftops, private dining rooms, studios, outdoor spaces', count: '180+ listed' },
  { id: 'games',       icon: '🎲', name: 'Games & activities', sub: 'Party game rental, photo booths, activity kits, bouncy castles, arcade', count: '120+ listed' },
  { id: 'other',       icon: '✨', name: 'Other partner', sub: 'Photographers, florists, decor, transport, party favours, hair & makeup', count: 'Open category' },
] as const

const PARTNER_BADGES: Record<string, { label: string; cls: string }> = {
  entertainer: { label: '🎩 Entertainer',       cls: 'bg-rose-lt text-rose' },
  food:        { label: '🍽 Food supplier',      cls: 'bg-teal-lt text-teal' },
  venue:       { label: '🏛 Venue',              cls: 'bg-blue-lt text-blue' },
  games:       { label: '🎲 Games & activities', cls: 'bg-gold-lt text-amber' },
  other:       { label: '✨ Other partner',      cls: 'bg-warm text-ink2' },
}

const DEMAND_DATA = [
  { label: 'Baby shower venues', w: '91%', count: '218' },
  { label: 'Magicians',          w: '78%', count: '187' },
  { label: 'Catering suppliers', w: '69%', count: '165' },
  { label: 'Fire performers',    w: '56%', count: '134' },
  { label: 'Games rental',       w: '48%', count: '115' },
  { label: 'Face painters',      w: '44%', count: '106' },
  { label: 'Stand-up comedians', w: '37%', count: '89' },
]

const BENEFITS = [
  { num: '2,800+', label: 'Active event planners searching monthly' },
  { num: '0%',     label: 'Commission for your first 6 months' },
  { num: '72h',    label: 'Average time to first booking inquiry' },
  { num: '4',      label: 'Canadian cities at launch · more coming' },
]

const TESTIMONIALS = [
  { quote: '"I signed up on a Tuesday and had my first inquiry by Wednesday evening. The listing setup took me less than 2 minutes — genuinely the easiest onboarding I\'ve done for any platform."', name: 'Marco M.', role: 'Magician · Toronto · 87 bookings', initials: 'MM', avatarCls: 'bg-rose-lt text-rose' },
  { quote: '"As a halal caterer, I was invisible on other platforms. Fête\'s category filters mean the right clients actually find me. I had 3 baby shower inquiries in my first week."', name: 'Fatima A.', role: 'Halal caterer · Mississauga · 42 bookings', initials: 'FA', avatarCls: 'bg-teal-lt text-teal' },
  { quote: '"The supplier dashboard is genuinely better than what we had before. Seeing how many planners searched for venues in my area this week keeps me motivated to respond fast."', name: 'Sarah J.', role: 'Event venue · Queen West · 29 bookings', initials: 'SJ', avatarCls: 'bg-blue-lt text-blue' },
]

/* ── small components ── */
function CheckItem({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-[9px] rounded-[10px] border cursor-pointer transition-all text-xs font-sans ${
        checked
          ? 'border-gold bg-gold-lt text-ink font-medium'
          : 'border-border bg-warm text-ink2 hover:border-gold'
      }`}
    >
      <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] flex-shrink-0 ${
        checked ? 'bg-gold border-gold text-white' : 'bg-white border border-border'
      }`}>
        {checked && '✓'}
      </div>
      {label}
    </div>
  )
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      className={`w-9 h-5 rounded-full relative cursor-pointer flex-shrink-0 transition-colors ${
        on ? 'bg-teal' : 'bg-warm border border-border'
      }`}
    >
      <div className={`absolute w-3.5 h-3.5 bg-white rounded-full top-[3px] transition-transform ${
        on ? 'translate-x-[18px]' : 'translate-x-[3px]'
      }`} />
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink2 mb-1.5 block">{children}</label>
}

function Input({ placeholder, type = 'text', value, defaultValue }: { placeholder?: string; type?: string; value?: string; defaultValue?: string }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      value={value}
      readOnly={value !== undefined}
      className="border border-border rounded-[10px] px-[13px] py-[10px] text-[13px] font-sans text-ink bg-warm outline-none focus:border-gold focus:bg-white w-full transition-colors"
    />
  )
}

function Select({ children }: { children: React.ReactNode }) {
  return (
    <select className="border border-border rounded-[10px] px-[13px] py-[10px] text-[13px] font-sans text-ink bg-warm outline-none focus:border-gold focus:bg-white w-full transition-colors">
      {children}
    </select>
  )
}

/* ── main component ── */
export default function PartnerSignUp() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const [partnerType, setPartnerType] = useState<PartnerType>(null)
  const [step, setStep] = useState<Step>(1)
  const [bizName, setBizName] = useState('')
  const [city, setCity] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  /* checkbox state: key → checked */
  const [checks, setChecks] = useState<Record<string, boolean>>({
    // Step 2 — entertainer types
    magician: false, fire: false, comedian: false, facePainter: false,
    balloon: false, musician: false, dj: false, circus: false, caricature: false,
    character: false, mc: false,
    // Step 2 — events
    evtBabyShower: true, evt1stBday: true, evtWelcomeBaby: true,
    evtEngagement: false, evtWedding: false, evtCorporate: false,
    // Step 4 — consent
    terms: false, emailConsent: false, accurate: false,
  })

  /* toggle state */
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    outsideFood: true, outsideDrinks: false, menuAvail: true,
    tastings: true, accessibility: true,
    allowMessages: true, instantBook: false, emailNotify: true,
  })

  /* availability days */
  const [days, setDays] = useState<Record<string, boolean>>({
    MON: true, TUE: true, WED: true, THU: true, FRI: true, SAT: true, SUN: false,
  })

  const toggleCheck = (k: string) => setChecks(p => ({ ...p, [k]: !p[k] }))
  const toggleToggle = (k: string) => setToggles(p => ({ ...p, [k]: !p[k] }))
  const toggleDay = (k: string) => setDays(p => ({ ...p, [k]: !p[k] }))

  const goStep = (n: Step) => setStep(n)

  const badge = partnerType ? PARTNER_BADGES[partnerType] : null

  function StepBadge() {
    if (!badge) return null
    return <span className={`text-[11px] font-semibold px-[13px] py-[5px] rounded-full flex items-center gap-1.5 ${badge.cls}`}>{badge.label}</span>
  }

  function ProgressDots() {
    const steps = [1, 2, 3, 4] as const
    const labels = ['Your details', 'Services', 'Listing setup', 'Review & go live']
    const currentNum = step === 'success' ? 4 : step
    return (
      <div className="flex items-center gap-0 mb-10">
        {steps.map((s, i) => {
          const done = currentNum > s
          const active = currentNum === s
          return (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 text-xs ${done ? 'text-teal' : active ? 'text-ink' : 'text-ink3'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                  done ? 'bg-teal border-teal text-white' :
                  active ? 'border-gold text-gold bg-gold-lt border' :
                  'border border-border text-ink3 bg-white'
                }`}>
                  {done ? '✓' : s}
                </div>
                <span>{labels[i]}</span>
              </div>
              {i < 3 && (
                <div className={`flex-1 h-px mx-1.5 ${done ? 'bg-teal' : 'bg-border'}`} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-12 py-[18px] border-b border-border sticky top-0 z-50" style={{ background: 'rgba(250,248,243,0.92)', backdropFilter: 'blur(8px)' }}>
        <Link href="/" className="font-garamond text-[26px] font-bold text-ink tracking-[-0.5px] no-underline">
          Fête<span className="text-gold not-italic" style={{ fontStyle: 'normal' }}>.</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[13px] text-ink2 no-underline hover:text-ink">Browse events</Link>
          <Link href="#benefits" className="text-[13px] text-ink2 no-underline hover:text-ink">How it works</Link>
          <Link href="#testimonials" className="text-[13px] text-ink2 no-underline hover:text-ink">Pricing</Link>
          {!isSignedIn && (
            <Link href="/sign-in" className="text-[13px] font-semibold px-5 py-2 rounded-full bg-ink text-white no-underline">
              Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* ── SIGNED-IN BANNER ── */}
      {isSignedIn && (
        <div className="bg-teal-lt border-b border-teal/25 px-12 py-3 flex items-center gap-3">
          <span className="text-teal text-base">✓</span>
          <div className="text-[13px] text-teal font-medium">
            You&apos;re signed in.{' '}
            <a href="#partner-selector" className="underline underline-offset-2">Select your partner type below</a>
            {' '}and complete the form — your listing goes live when you click <strong>Go live now</strong> in step 4.
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="border-b border-border">
        <div className="max-w-[1200px] mx-auto px-12 py-20 pb-16 grid grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-gold border border-gold/35 px-3 py-[5px] rounded-full mb-5 bg-gold-lt">
              <span className="w-[7px] h-[7px] rounded-full bg-teal animate-pulse flex-shrink-0" />
              Accepting new partners · Canada-wide
            </div>
            <h1 className="font-garamond text-[58px] leading-[1.06] font-bold tracking-[-1px] text-ink mb-5">
              Get discovered<br />
              by thousands of<br />
              <em className="text-gold" style={{ fontStyle: 'italic' }}>event planners</em>
            </h1>
            <p className="text-base text-ink2 leading-[1.75] mb-8 max-w-[480px]">
              Join Fête — Canada's event marketplace connecting venues, entertainers, food suppliers, and
              partners with people planning the moments that matter most.
            </p>
            <div className="flex gap-5 flex-wrap">
              {[['🎁', 'Free for 6 months'], ['⚡', 'Live in under 2 minutes'], ['🇨🇦', 'Canada-first platform'], ['🔒', 'PIPEDA compliant']].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-ink2">
                  <span className="text-base">{icon}</span> {text}
                </div>
              ))}
            </div>
          </div>

          {/* Demand widget */}
          <div className="bg-white border border-border rounded-2xl p-[22px]">
            <div className="text-[10px] font-semibold tracking-[0.09em] uppercase text-ink3 mb-3.5 flex items-center gap-1.5">
              <span className="w-[7px] h-[7px] rounded-full bg-teal animate-pulse" />
              Live searches in Toronto this week
            </div>
            {DEMAND_DATA.map(d => (
              <div key={d.label} className="flex items-center gap-2.5 py-[7px] border-b border-border last:border-none">
                <div className="text-xs text-ink2 min-w-[140px]">{d.label}</div>
                <div className="flex-1 h-[5px] bg-warm rounded-[3px] overflow-hidden">
                  <div className="h-full bg-gold rounded-[3px] transition-all" style={{ width: d.w }} />
                </div>
                <div className="text-xs font-semibold text-ink min-w-[34px] text-right font-mono">{d.count}</div>
              </div>
            ))}
            <div className="mt-3.5 pt-3 border-t border-border text-[11px] text-ink3">
              Your competitors are being discovered here.{' '}
              <strong className="text-ink">Claim your free listing →</strong>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS BAR ── */}
      <div className="bg-ink px-12 py-12 grid grid-cols-4 gap-8">
        {BENEFITS.map(b => (
          <div key={b.num} className="text-center">
            <div className="font-garamond text-[44px] font-bold text-gold leading-none mb-1.5">{b.num}</div>
            <div className="text-[13px] leading-[1.5]" style={{ color: 'rgba(255,255,255,0.65)' }}>{b.label}</div>
          </div>
        ))}
      </div>

      {/* ── PARTNER TYPE SELECTOR ── */}
      <div className="bg-white border-t border-b border-border py-15 px-12" id="partner-selector">
        <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink3 text-center mb-2.5">Step 1</div>
        <h2 className="font-garamond text-[40px] font-bold text-center tracking-[-0.5px] text-ink mb-10">
          What best describes you?
        </h2>
        <div className="grid grid-cols-5 gap-3.5 max-w-[1100px] mx-auto">
          {PARTNER_TYPES.map(pt => (
            <div
              key={pt.id}
              onClick={() => setPartnerType(pt.id as PartnerType)}
              className={`relative border rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center gap-2.5 transition-all ${
                partnerType === pt.id
                  ? 'border-2 border-gold bg-gold-lt -translate-y-[3px]'
                  : 'border-border bg-cream hover:border-gold hover:bg-white hover:-translate-y-[3px]'
              }`}
            >
              {partnerType === pt.id && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-gold text-white text-[11px] font-bold flex items-center justify-center">
                  ✓
                </div>
              )}
              <div className={`w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-2xl border ${
                partnerType === pt.id ? 'bg-gold-lt border-gold/30' : 'bg-white border-border'
              }`}>
                {pt.icon}
              </div>
              <div className="text-sm font-semibold text-ink">{pt.name}</div>
              <div className="text-[11px] text-ink3 leading-[1.4]">{pt.sub}</div>
              <div className="text-[10px] font-semibold text-gold bg-gold-lt px-2 py-[2px] rounded-full">{pt.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MULTI-STEP FORM ── */}
      {partnerType && (
        <div className="max-w-[820px] mx-auto px-12 py-15" id="form-section">
          {step !== 'success' && <ProgressDots />}

          <div className="bg-white border border-border rounded-[24px] overflow-hidden">

            {/* ── STEP 1: Your details ── */}
            {step === 1 && (
              <>
                <div className="flex items-start justify-between px-8 pt-7 pb-5 border-b border-border">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.09em] text-gold mb-1">Step 1 of 4</div>
                    <div className="text-xl font-semibold text-ink">Tell us about yourself</div>
                    <div className="text-[13px] text-ink3 mt-[3px]">Basic info — takes under 90 seconds</div>
                  </div>
                  <StepBadge />
                </div>
                <div className="px-8 py-7 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><FieldLabel>First name *</FieldLabel><Input placeholder="Emma" /></div>
                    <div><FieldLabel>Last name *</FieldLabel><Input placeholder="Tremblay" /></div>
                    <div>
                      <FieldLabel>Business / stage name *</FieldLabel>
                      <input
                        type="text"
                        placeholder="Your business or performer name"
                        value={bizName}
                        onChange={e => setBizName(e.target.value)}
                        className="border border-border rounded-[10px] px-[13px] py-[10px] text-[13px] font-sans text-ink bg-warm outline-none focus:border-gold focus:bg-white w-full transition-colors"
                      />
                    </div>
                    <div><FieldLabel>Business email *</FieldLabel><Input type="email" placeholder="emma@yourbusiness.ca" /></div>
                    <div><FieldLabel>Phone number</FieldLabel><Input type="tel" placeholder="+1 (416) 555-0100" /></div>
                    <div><FieldLabel>Website or Instagram</FieldLabel><Input type="url" placeholder="https:// or @handle" /></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3.5">
                    <div>
                      <FieldLabel>City *</FieldLabel>
                      <select
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="border border-border rounded-[10px] px-[13px] py-[10px] text-[13px] font-sans text-ink bg-warm outline-none focus:border-gold focus:bg-white w-full transition-colors"
                      >
                        <option value="">Select city</option>
                        {['Toronto','Vancouver','Calgary','Ottawa','Montreal','Edmonton','Other'].map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <FieldLabel>Province *</FieldLabel>
                      <Select><option value="">Select</option>{['ON','BC','AB','QC','MB','SK','NS','NB','PE','NL'].map(p=><option key={p}>{p}</option>)}</Select>
                    </div>
                    <div>
                      <FieldLabel>Travel radius</FieldLabel>
                      <Select>{['Local only (my city)','Up to 50 km','Up to 100 km','Province-wide','Canada-wide'].map(r=><option key={r}>{r}</option>)}</Select>
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Brief bio (shown on your listing) *</FieldLabel>
                    <textarea
                      placeholder="Tell event planners what makes you unique. What events do you love? What's your style? (2–3 sentences is perfect)"
                      className="border border-border rounded-[10px] px-[13px] py-[10px] text-[13px] font-sans text-ink bg-warm outline-none focus:border-gold focus:bg-white w-full resize-y min-h-[90px] transition-colors"
                    />
                    <div className="text-[10px] text-ink3 mt-1">
                      This is the first thing planners read. Be specific — "I specialise in baby showers and 1st birthdays for families in the GTA" converts 3× better than generic descriptions.
                    </div>
                  </div>
                  <div className="border-t border-border pt-4 flex items-center gap-2.5 bg-gold-lt rounded-[10px] px-4 py-3">
                    <span className="text-base flex-shrink-0">🔒</span>
                    <div className="text-xs text-ink2">
                      You&apos;ll create a free account at the final step — no password needed yet.
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-8 py-5 border-t border-border bg-warm">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] text-ink3">25% complete</span>
                    <div className="w-30 h-1 bg-border rounded-sm overflow-hidden">
                      <div className="h-full bg-gold rounded-sm" style={{ width: '25%' }} />
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <button onClick={() => setPartnerType(null)} className="text-[13px] font-medium px-[22px] py-2.5 rounded-full border border-border bg-transparent text-ink2 cursor-pointer font-sans hover:bg-warm transition-colors">
                      ← Change partner type
                    </button>
                    <button onClick={() => goStep(2)} className="text-[13px] font-semibold px-[26px] py-2.5 rounded-full bg-ink text-white border-none cursor-pointer font-sans flex items-center gap-1.5 hover:opacity-85 transition-opacity">
                      Continue → <span>Services</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 2: Services ── */}
            {step === 2 && (
              <>
                <div className="flex items-start justify-between px-8 pt-7 pb-5 border-b border-border">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.09em] text-gold mb-1">Step 2 of 4</div>
                    <div className="text-xl font-semibold text-ink">Your services &amp; pricing</div>
                    <div className="text-[13px] text-ink3 mt-[3px]">Help planners understand what you offer and what to expect to pay</div>
                  </div>
                  <StepBadge />
                </div>
                <div className="px-8 py-7">
                  {partnerType === 'entertainer' && (
                    <>
                      <div className="text-xs font-semibold text-ink mb-2.5">What type of entertainer are you? (select all that apply)</div>
                      <div className="grid grid-cols-3 gap-2 mb-[18px]">
                        {[['magician','🪄 Magician'],['fire','🔥 Fire performer'],['comedian','🎭 Stand-up comedian'],['facePainter','🎨 Face painter'],['balloon','🎈 Balloon artist'],['musician','🎵 Musician / band'],['dj','🎤 DJ'],['circus','🎪 Circus / acrobat'],['caricature','✏️ Caricature artist'],['character','🧙 Character performer'],['mc','🎤 MC / host']].map(([k, label]) => (
                          <CheckItem key={k} label={label} checked={!!checks[k]} onToggle={() => toggleCheck(k)} />
                        ))}
                      </div>
                      <div className="text-xs font-semibold text-ink mb-2.5">Which events do you perform at?</div>
                      <div className="grid grid-cols-3 gap-2 mb-[18px]">
                        {[['evtBabyShower','👶 Baby shower'],['evt1stBday','🎠 1st birthday'],['evtWelcomeBaby','🏠 Welcome baby'],['evtEngagement','💍 Engagement party'],['evtWedding','💒 Wedding'],['evtCorporate','🏢 Corporate event']].map(([k, label]) => (
                          <CheckItem key={k} label={label} checked={!!checks[k]} onToggle={() => toggleCheck(k)} />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <FieldLabel>Minimum booking rate *</FieldLabel>
                          <div className="flex items-center gap-2"><span className="text-[13px] text-ink3 flex-shrink-0">CAD $</span><Input type="number" placeholder="80" /><span className="text-[13px] text-ink3 flex-shrink-0">/ hr</span></div>
                        </div>
                        <div>
                          <FieldLabel>Performance duration options</FieldLabel>
                          <Select><option>30 min / 1 hr / 2 hr</option><option>1 hr only</option><option>2 hr only</option></Select>
                        </div>
                        <div><FieldLabel>Max events per week</FieldLabel><Input type="number" placeholder="5" /></div>
                        <div>
                          <FieldLabel>Age group suitability</FieldLabel>
                          <Select><option>All ages</option><option>Kids (3–12)</option><option>Adults only (18+)</option><option>Family (all ages)</option></Select>
                        </div>
                      </div>
                    </>
                  )}
                  {partnerType === 'venue' && (
                    <>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div><FieldLabel>Venue type</FieldLabel><Select><option>Event hall / ballroom</option><option>Private dining room</option><option>Rooftop / terrace</option><option>Garden / outdoor space</option><option>Loft / studio</option><option>Unique / other</option></Select></div>
                        <div><FieldLabel>Indoor / outdoor</FieldLabel><Select><option>Indoor</option><option>Outdoor</option><option>Both (flexible)</option></Select></div>
                        <div><FieldLabel>Minimum capacity</FieldLabel><Input type="number" placeholder="10" /></div>
                        <div><FieldLabel>Maximum capacity *</FieldLabel><Input type="number" placeholder="80" /></div>
                        <div><FieldLabel>Hourly rate (CAD $) *</FieldLabel><Input type="number" placeholder="120" /></div>
                        <div><FieldLabel>Minimum booking hours</FieldLabel><Select><option>2 hours</option><option>3 hours</option><option>4 hours</option><option>Half day (4h)</option><option>Full day (8h)</option></Select></div>
                      </div>
                      <div className="text-xs font-semibold text-ink mb-2.5">Venue policies</div>
                      <div className="flex flex-col gap-2.5">
                        {[
                          ['outsideFood','Outside food allowed','Clients may bring or order external catering'],
                          ['outsideDrinks','Outside drinks / BYOB allowed','Clients may bring their own alcohol'],
                          ['menuAvail','Restaurant / kitchen menu available','Venue provides in-house catering or bar service'],
                          ['tastings','Sample tastings bookable','Allow clients to book a tasting appointment'],
                          ['accessibility','Accessibility (wheelchair access)','Venue is accessible to guests with mobility needs'],
                        ].map(([k, label, desc]) => (
                          <div key={k} className="flex items-center justify-between px-3.5 py-2.5 border border-border rounded-[10px] bg-warm">
                            <div>
                              <div className="text-[13px] text-ink2">{label}</div>
                              <div className="text-[10px] text-ink3 mt-0.5">{desc}</div>
                            </div>
                            <Toggle on={!!toggles[k]} onToggle={() => toggleToggle(k)} />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {(partnerType === 'food' || partnerType === 'games' || partnerType === 'other') && (
                    <div className="text-center text-ink2 py-8">
                      <div className="text-2xl mb-3">{PARTNER_TYPES.find(p => p.id === partnerType)?.icon}</div>
                      <div className="text-sm font-medium mb-1">{PARTNER_TYPES.find(p => p.id === partnerType)?.name} — service details</div>
                      <div className="text-xs text-ink3">Configure your services and pricing to match what you offer.</div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between px-8 py-5 border-t border-border bg-warm">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] text-ink3">50% complete</span>
                    <div className="w-30 h-1 bg-border rounded-sm overflow-hidden"><div className="h-full bg-gold rounded-sm" style={{ width: '50%' }} /></div>
                  </div>
                  <div className="flex gap-2.5">
                    <button onClick={() => goStep(1)} className="text-[13px] font-medium px-[22px] py-2.5 rounded-full border border-border bg-transparent text-ink2 cursor-pointer font-sans">← Back</button>
                    <button onClick={() => goStep(3)} className="text-[13px] font-semibold px-[26px] py-2.5 rounded-full bg-ink text-white border-none cursor-pointer font-sans hover:opacity-85 transition-opacity">Continue → <span>Listing setup</span></button>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 3: Listing setup ── */}
            {step === 3 && (
              <>
                <div className="flex items-start justify-between px-8 pt-7 pb-5 border-b border-border">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.09em] text-gold mb-1">Step 3 of 4</div>
                    <div className="text-xl font-semibold text-ink">Set up your listing</div>
                    <div className="text-[13px] text-ink3 mt-[3px]">Photos and availability — what planners see first</div>
                  </div>
                  <StepBadge />
                </div>
                <div className="px-8 py-7 space-y-5">
                  <div>
                    <div className="text-xs font-semibold text-ink mb-3">Add photos (1 required, up to 8)</div>
                    <div className="border-[1.5px] border-dashed border-border rounded-2xl p-7 text-center cursor-pointer hover:border-gold hover:bg-gold-lt transition-colors bg-warm">
                      <div className="text-3xl mb-2">📸</div>
                      <div className="text-[13px] text-ink2">Drag &amp; drop photos here, or <strong className="text-gold">click to browse</strong></div>
                      <div className="text-[11px] text-ink3 mt-1">JPG or PNG · Max 5MB per photo · First photo becomes your cover image</div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <div className="relative w-20 h-[70px] rounded-lg bg-warm border border-border flex items-center justify-center text-2xl">
                        🎪
                        <div className="absolute bottom-1 left-1 text-[8px] font-bold bg-ink text-white px-1.5 py-[1px] rounded-[3px]">Cover</div>
                      </div>
                      <div className="w-20 h-[70px] rounded-lg bg-warm border border-border flex items-center justify-center text-2xl">🌿</div>
                      <div className="w-20 h-[70px] rounded-lg bg-warm border border-dashed border-border flex items-center justify-center text-2xl text-ink3 cursor-pointer">＋</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-ink mb-3">Set your weekly availability</div>
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {Object.entries(days).map(([day, on]) => (
                        <div
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`text-center py-2.5 px-1.5 rounded-[10px] cursor-pointer transition-all ${
                            on ? 'border-[1.5px] border-gold bg-gold-lt' : 'border border-border bg-cream'
                          }`}
                        >
                          <div className={`text-[10px] font-bold ${on ? 'text-amber' : 'text-ink3'}`}>{day}</div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><FieldLabel>Available from</FieldLabel><Input type="time" value="09:00" /></div>
                      <div><FieldLabel>Available until</FieldLabel><Input type="time" value="22:00" /></div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-5">
                    <div className="text-xs font-semibold text-ink mb-2.5">Optional: Add video / show reel</div>
                    <FieldLabel>YouTube or Vimeo link</FieldLabel>
                    <Input type="url" placeholder="https://youtube.com/watch?v=..." />
                    <div className="text-[10px] text-ink3 mt-1">Listings with a video get 3× more inquiries. A 60-second highlight reel is ideal.</div>
                  </div>

                  <div className="border-t border-border pt-5">
                    <div className="text-xs font-semibold text-ink mb-2.5">Communication preferences</div>
                    <div className="flex flex-col gap-2.5">
                      {[['allowMessages','Allow direct messages from planners','Planners can send you a message before booking'],['instantBook','Instant booking (no approval needed)','Planners can book available slots directly — you confirm after'],['emailNotify','Email me when I get an inquiry','Instant notification for every new inquiry']].map(([k, label, desc]) => (
                        <div key={k} className="flex items-center justify-between px-3.5 py-2.5 border border-border rounded-[10px] bg-warm">
                          <div>
                            <div className="text-[13px] text-ink2">{label}</div>
                            <div className="text-[10px] text-ink3 mt-0.5">{desc}</div>
                          </div>
                          <Toggle on={!!toggles[k]} onToggle={() => toggleToggle(k)} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-8 py-5 border-t border-border bg-warm">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] text-ink3">75% complete</span>
                    <div className="w-30 h-1 bg-border rounded-sm overflow-hidden"><div className="h-full bg-gold rounded-sm" style={{ width: '75%' }} /></div>
                  </div>
                  <div className="flex gap-2.5">
                    <button onClick={() => goStep(2)} className="text-[13px] font-medium px-[22px] py-2.5 rounded-full border border-border bg-transparent text-ink2 cursor-pointer font-sans">← Back</button>
                    <button onClick={() => goStep(4)} className="text-[13px] font-semibold px-[26px] py-2.5 rounded-full bg-ink text-white border-none cursor-pointer font-sans hover:opacity-85 transition-opacity">Continue → <span>Review</span></button>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 4: Review & go live ── */}
            {step === 4 && (
              <>
                <div className="flex items-start justify-between px-8 pt-7 pb-5 border-b border-border">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.09em] text-gold mb-1">Step 4 of 4 — Almost there!</div>
                    <div className="text-xl font-semibold text-ink">Review &amp; go live</div>
                    <div className="text-[13px] text-ink3 mt-[3px]">Confirm your details and publish your listing</div>
                  </div>
                  <StepBadge />
                </div>
                <div className="px-8 py-7 space-y-5">
                  {/* Preview card */}
                  <div>
                    <div className="text-xs font-semibold text-ink mb-3">Your listing preview</div>
                    <div className="border border-border rounded-2xl overflow-hidden flex">
                      <div className="w-30 bg-warm flex items-center justify-center text-[42px] flex-shrink-0">🎪</div>
                      <div className="p-[14px] flex-1">
                        <div className="text-sm font-semibold text-ink">{bizName || 'Your Business Name'}</div>
                        <div className="text-[11px] text-ink3 mt-0.5 mb-2">{badge?.label} · Toronto, ON</div>
                        <div className="flex gap-1.5 flex-wrap mb-2">
                          <span className="text-[10px] font-semibold px-2 py-[2px] rounded-full bg-teal-lt text-teal">✓ Outside food</span>
                          <span className="text-[10px] font-semibold px-2 py-[2px] rounded-full bg-gold-lt text-amber">⭐ New listing</span>
                        </div>
                        <div className="text-xs text-ink2">from <strong>$120/hr</strong> · Responds within 24h</div>
                      </div>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div>
                    <div className="text-xs font-semibold text-ink mb-3">Launch checklist</div>
                    <div className="flex flex-col gap-1.5">
                      {[
                        [true, '✅', 'text-teal', 'Business details complete', 'Name, city, bio, contact info'],
                        [true, '✅', 'text-teal', 'Services & pricing set', 'Planners can see what you offer and starting rates'],
                        [true, '✅', 'text-teal', 'Cover photo uploaded', 'First impression locked in'],
                        [false, '⏳', 'text-amber', 'Identity verification (optional at launch)', 'Complete within 7 days to earn the Verified badge'],
                        [false, '⏳', 'text-amber', 'Stripe payout account (optional at launch)', 'Connect your bank to receive deposits and payments'],
                      ].map(([done, icon, textCls, title, sub]) => (
                        <div key={String(title)} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] ${done ? 'bg-teal-lt' : 'bg-gold-lt'}`}>
                          <span className="text-base">{icon}</span>
                          <div>
                            <div className={`text-xs font-semibold ${textCls}`}>{title}</div>
                            <div className="text-[10px] text-ink3">{sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing reminder */}
                  <div className="bg-gold-lt border border-gold/30 rounded-2xl px-5 py-4">
                    <div className="text-[13px] font-semibold text-amber mb-1">🎁 Free for your first 6 months</div>
                    <div className="text-xs text-ink2 leading-[1.6]">
                      No commission, no listing fees. After 6 months, a simple 8–10% commission on completed bookings applies.
                      You'll always earn more through Fête than through a traditional agency (which takes 20–40%).
                    </div>
                  </div>

                  {/* Consent */}
                  <div className="flex flex-col gap-2.5">
                    {[['terms','I agree to the Partner Terms of Service and Privacy Policy (PIPEDA compliant)'],['emailConsent','I consent to receive booking inquiries and platform notifications by email'],['accurate','I confirm the information I\'ve provided is accurate and I am authorised to list this business']].map(([k, label]) => (
                      <CheckItem key={k} label={label} checked={!!checks[k]} onToggle={() => toggleCheck(k)} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between px-8 py-5 border-t border-border bg-warm">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] text-ink3">100% complete</span>
                    <div className="w-30 h-1 bg-border rounded-sm overflow-hidden"><div className="h-full bg-teal rounded-sm" style={{ width: '100%' }} /></div>
                  </div>
                  <div className="flex gap-2.5">
                    <button onClick={() => goStep(3)} className="text-[13px] font-medium px-[22px] py-2.5 rounded-full border border-border bg-transparent text-ink2 cursor-pointer font-sans">← Back</button>
                    <button
                      disabled={isSubmitting || isSignedIn === undefined}
                      onClick={async () => {
                        if (isSignedIn === false) {
                          router.push('/sign-up')
                          return
                        }
                        setIsSubmitting(true)
                        try {
                          const res = await fetch('/api/suppliers/create', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              name: bizName || 'My Business',
                              categories: [partnerType],
                              city: city || 'Toronto',
                              priceMin: null,
                              priceMax: null,
                            }),
                          })
                          if (res.ok) {
                            goStep('success')
                          } else {
                            alert('Something went wrong. Please try again.')
                          }
                        } catch {
                          alert('Network error. Please try again.')
                        } finally {
                          setIsSubmitting(false)
                        }
                      }}
                      className="text-[13px] font-semibold px-[26px] py-2.5 rounded-full bg-gold text-white border-none cursor-pointer font-sans hover:opacity-85 transition-opacity disabled:opacity-50"
                    >
                      {isSubmitting
                        ? 'Publishing…'
                        : isSignedIn === undefined
                          ? 'Loading…'
                          : isSignedIn
                            ? '🚀 Go live now'
                            : '🔐 Create account & go live'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── SUCCESS ── */}
            {step === 'success' && (
              <div className="text-center px-8 py-15">
                <div className="text-[56px] mb-4">🎉</div>
                <div className="font-garamond text-[36px] font-bold text-ink mb-2.5">You're live on Fête!</div>
                <div className="text-[15px] text-ink2 leading-[1.7] max-w-[440px] mx-auto mb-7">
                  Your listing is now searchable by event planners across Canada. Here's what happens next:
                </div>
                <div className="flex flex-col gap-2.5 mb-7 text-left max-w-[480px] mx-auto">
                  {[
                    'Check your email for your listing link — share it anywhere',
                    'Complete your Verified badge (ID + insurance) within 7 days to rank higher in search',
                    'Connect your Stripe account to start receiving deposits and payments',
                    'Your first inquiry is expected within 72 hours based on current platform demand',
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-warm rounded-[10px] px-4 py-3">
                      <div className="w-6 h-6 rounded-full bg-gold text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                      <div className="text-[13px] text-ink2">{text}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => router.push('/partner/dashboard')}
                  className="text-[13px] font-semibold px-[26px] py-2.5 rounded-full bg-gold text-white border-none cursor-pointer font-sans hover:opacity-85 transition-opacity"
                >
                  Open your dashboard →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SOCIAL PROOF ── */}
      <div className="bg-white border-t border-border py-15 px-12">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink3 text-center mb-2.5">What partners say</div>
          <h2 className="font-garamond text-[40px] font-bold text-center tracking-[-0.5px] text-ink mb-10">Trusted by suppliers across Canada</h2>
          <div className="grid grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-warm border border-border rounded-2xl p-6">
                <div className="font-garamond text-base text-ink2 leading-[1.7] mb-3.5 italic">{t.quote}</div>
                <div className="flex items-center gap-2.5">
                  <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${t.avatarCls}`}>{t.initials}</div>
                  <div>
                    <div className="text-xs font-semibold text-ink">{t.name}</div>
                    <div className="text-[11px] text-ink3">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
