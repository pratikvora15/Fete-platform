import PartnerPageShell from '../_components/PartnerPageShell'

export default function ProfilePage() {
  return (
    <PartnerPageShell>
      <div className="px-8 py-8">
        <div className="mb-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink3 mb-1">My listing</div>
          <h1 className="text-2xl font-semibold text-ink">Profile</h1>
          <p className="text-[13px] text-ink2 mt-1">Edit your business name, bio, contact info, and service details.</p>
        </div>
        <div className="bg-white border border-border rounded-2xl px-6 py-10 text-center max-w-lg">
          <div className="text-3xl mb-3">🤹</div>
          <div className="text-sm font-semibold text-ink mb-1">Profile editor coming soon</div>
          <div className="text-xs text-ink3">You&apos;ll be able to edit every field of your listing here.</div>
        </div>
      </div>
    </PartnerPageShell>
  )
}
