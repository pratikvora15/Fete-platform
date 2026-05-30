import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function PartnerSignInPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-12 py-[18px] border-b border-border">
        <Link href="/" className="font-display text-2xl font-bold text-ink tracking-tight no-underline">
          Fête<span className="text-gold">.</span>
        </Link>
        <div className="flex items-center gap-3 text-[13px]">
          <span className="text-ink3">Not a partner yet?</span>
          <Link href="/partner/sign-up" className="font-semibold text-ink hover:opacity-70 no-underline">
            Create your listing →
          </Link>
        </div>
      </nav>

      {/* Body */}
      <div className="flex flex-1">

        {/* Left: context panel */}
        <div className="w-[420px] flex-shrink-0 bg-ink flex flex-col justify-center px-14 py-16 gap-8">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gold mb-3">Partner portal</div>
            <div className="font-display text-[36px] font-bold leading-[1.1] text-white mb-4">
              Welcome back to your listing
            </div>
            <p className="text-[14px] leading-[1.7]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Sign in with your email and password to manage your calendar, respond to inquiries, and track your earnings.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              ['📊', 'Dashboard & analytics'],
              ['💬', 'Inquiries & bookings'],
              ['📅', 'Availability calendar'],
              ['💰', 'Earnings & payouts'],
            ].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-2.5 text-[13px]" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Use the email &amp; password you registered with. Enable password auth in your Clerk dashboard if needed.
          </div>
        </div>

        {/* Right: Clerk widget */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-[400px]">
            <SignIn
              forceRedirectUrl="/auth/callback?from=partner"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'shadow-none border border-border rounded-2xl bg-white p-8',
                  headerTitle: 'font-display text-2xl text-ink',
                  headerSubtitle: 'text-ink3 text-sm',
                  socialButtonsBlockButton: 'border border-border rounded-xl',
                  formButtonPrimary: 'bg-ink hover:opacity-85 rounded-xl font-sans font-semibold',
                  footerActionLink: 'text-gold hover:opacity-70',
                  identityPreviewEditButton: 'text-gold',
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
