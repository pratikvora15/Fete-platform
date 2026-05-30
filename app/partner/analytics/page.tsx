import PartnerPageShell from '../_components/PartnerPageShell'

export default function AnalyticsPage() {
  return (
    <PartnerPageShell>
      <div className="px-8 py-8">
        <div className="mb-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink3 mb-1">Analytics</div>
          <h1 className="text-2xl font-semibold text-ink">Performance</h1>
          <p className="text-[13px] text-ink2 mt-1">Profile views, search impressions, click-through rate, and conversion trends.</p>
        </div>
        <div className="bg-white border border-border rounded-2xl px-6 py-10 text-center max-w-lg">
          <div className="text-3xl mb-3">📈</div>
          <div className="text-sm font-semibold text-ink mb-1">Advanced analytics coming soon</div>
          <div className="text-xs text-ink3">See how planners find and interact with your listing over time.</div>
        </div>
      </div>
    </PartnerPageShell>
  )
}
