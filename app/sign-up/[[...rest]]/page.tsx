import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-12 py-[18px] border-b border-border">
        <Link href="/" className="font-display text-2xl font-bold text-ink tracking-tight no-underline">
          Fête<span className="text-gold">.</span>
        </Link>
        <div className="flex items-center gap-3 text-[13px]">
          <span className="text-ink3">Already have an account?</span>
          <Link href="/sign-in" className="font-semibold text-ink hover:opacity-70 no-underline">
            Sign in →
          </Link>
        </div>
      </nav>

      {/* Body */}
      <div className="flex flex-1 items-center justify-center py-16 px-8">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gold mb-2">Free to join</div>
            <h1 className="font-display text-3xl font-bold text-ink mb-2">Find your perfect event supplier</h1>
            <p className="text-[13px] text-ink2">Create a free account to browse all suppliers, save favourites, and send inquiries.</p>
          </div>

          <SignUp
            forceRedirectUrl="/auth/callback"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border border-border rounded-2xl bg-white p-8',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton: 'border border-border rounded-xl',
                formButtonPrimary: 'bg-ink hover:opacity-85 rounded-xl font-sans font-semibold',
                footerActionLink: 'text-gold hover:opacity-70',
              },
            }}
          />

          <p className="text-center text-[11px] text-ink3 mt-4">
            Are you a supplier?{' '}
            <Link href="/partner/sign-up" className="text-gold no-underline hover:opacity-70">
              List your service →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
