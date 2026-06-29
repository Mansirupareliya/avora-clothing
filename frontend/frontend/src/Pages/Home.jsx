import Footer from "../Component/Footer";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6 md:space-y-8">
      {/* Hero Section */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] md:tracking-[0.25em] text-[var(--primary)] font-semibold">
              Welcome to Dashboard
            </p>
            <h1 className="logo-text mt-3 text-3xl md:text-5xl font-bold text-[var(--text)]">
              AVORA Studio
            </h1>
            <p className="mt-4 max-w-2xl text-sm md:text-base text-[var(--muted)] leading-relaxed font-light">
              Manage your premium menswear catalog, update pricing, track inventory, and keep your collection ready for discerning customers.
            </p>
          </div>

          <div className="rounded-2xl bg-[var(--primary)] px-6 py-4 md:px-8 md:py-6 text-[var(--surface)] shadow-2xl border border-[var(--border)]">
            <p className="text-xs text-[var(--surface)]/70 uppercase tracking-[0.15em] font-medium">Active Store</p>
            <p className="logo-text mt-3 text-xl md:text-2xl font-semibold">AVORA</p>
            <p className="mt-2 text-xs md:text-sm text-[var(--surface)]/70">Premium Collection</p>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {[
          {
            icon: "📊",
            title: "Total Products",
            value: "Live",
            description: "Auto-synced inventory from your catalog",
          },
          {
            icon: "⚡",
            title: "Quick Update",
            value: "Fast",
            description: "Add, edit, and publish instantly",
          },
          {
            icon: "🔒",
            title: "Data Security",
            value: "Secure",
            description: "Safe, encrypted, and reliable storage",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6 shadow-md hover:shadow-xl hover:border-[var(--primary)] transition-all duration-300 group"
          >
            <div className="text-3xl md:text-4xl mb-3 group-hover:scale-110 transition-transform">
              {card.icon}
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--primary)] font-semibold">
              {card.title}
            </p>
            <p className="mt-4 text-2xl md:text-3xl font-bold text-[var(--text)]">
              {card.value}
            </p>
            <p className="mt-3 text-xs md:text-sm text-[var(--muted)] leading-relaxed">{card.description}</p>
          </div>
        ))}
      </section>

      {/* Info Section */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:p-6 shadow-sm border-l-4 border-l-[var(--primary)]">
        <h3 className="font-semibold text-[var(--text)]">💡 Pro Tip</h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Use the Products page to manage your entire collection. Upload high-quality images, set competitive pricing, and track inventory in real-time.
        </p>
      </section>

      <Footer />
    </div>
  );
}