// RealRisk dashboard (static app in public/realrisk, synced from the
// realrisk-mvp repo by scripts/sync-realrisk-app.mjs). The static files hold
// no MLS data — the app loads it from GET /api/realrisk/listings, which
// requires the 4Rivers session.
export default function RealriskPage() {
  return (
    <iframe
      src="/realrisk/index.html"
      title="RealRisk"
      className="block w-full h-full border-0 bg-white"
    />
  )
}
