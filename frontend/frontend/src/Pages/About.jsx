import { Link } from "react-router-dom";
import { useEffect } from "react";
import Footer from "../Component/Footer";

export default function About() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const values = [
    {
      title: "Sustainable Sourcing",
      description: "We source only organic European linen, GOTS-certified Egyptian cotton, and recycled performance blends to ensure our ecological footprint is as refined as our designs.",
      icon: "🌱"
    },
    {
      title: "Small-Batch Production",
      description: "Rejecting mass production, we manufacture in limited runs of 5 to 100 pieces per style. This ensures absolute exclusivity and eliminates the waste associated with fast fashion.",
      icon: "✂️"
    },
    {
      title: "Artisanal Craft",
      description: "Our collections are tailored by hand in family-run ateliers across Portugal and Italy, supporting traditional expertise and ensuring fair wages for all craftspeople.",
      icon: "🪡"
    },
    {
      title: "Timeless Longevity",
      description: "We design garments with generous seam allowances, high-density stitching, and premium finishes. They are built to wear, age, and belong in your wardrobe for a lifetime.",
      icon: "⏳"
    },
    {
      title: "Radical Honesty",
      description: "We maintain absolute transparency regarding our supply chain, manufacturing costs, and labor standards. Premium menswear deserves a clean conscience.",
      icon: "🔍"
    }
  ];

  const features = [
    {
      title: "Smarter Natural Fabrics",
      text: "Our garments combine natural premium fibers with innovative eco-friendly treatments. By infusing long-staple cotton and linen with natural silver-ion mineral solutions, our shirts naturally repel odor-causing bacteria. Wear more, wash less, and extend the lifespan of your wardrobe."
    },
    {
      title: "Zero-Plastic Packaging",
      text: "Every AVORA purchase is enclosed in protective garment shields made from fully recycled materials. Outer mailers are constructed from carbon-neutral sugarcane derivatives, making our entire fulfillment cycle compostable and green."
    },
    {
      title: "The AVORA Circle",
      text: "We take responsibility for the entire lifecycle of our garments. Through our circular loop initiative, you can return your pre-worn AVORA items at any time. We will recycle the fibers to spin new luxury yarn, offering you credit toward your next curation."
    },
    {
      title: "Made in Portugal & Italy",
      text: "We partner exclusively with WRAP-certified family tailors who employ self-sufficient solar initiatives. By keeping our manufacturing within Europe, we dramatically reduce transportation emissions and guarantee dignified working conditions."
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans">
      {/* Hero Section */}
      <section 
        className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center bg-[var(--primary)] overflow-hidden"
        style={{
          backgroundAttachment: "scroll"
        }}
      >
        {/* Background Image with Zoom Effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out hover:scale-105"
          style={{
            backgroundImage: `url('/avora_about_hero.png')`,
            opacity: 0.45
          }}
        />
        {/* Elegant Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)] via-transparent to-[var(--primary)]/50" />

        {/* Content */}
        <div className="relative max-w-4xl mx-auto px-4 text-center z-10 space-y-6">
          <div className="inline-flex items-center gap-4">
            <div className="h-[1px] w-8 md:w-12 bg-[var(--accent)]"></div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)] font-semibold animate-pulse">
              The Art of Slow Tailoring
            </p>
            <div className="h-[1px] w-8 md:w-12 bg-[var(--accent)]"></div>
          </div>
          <h1 
            className="hero-title text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-none uppercase"
            style={{ fontFamily: "'PlatNomor', 'Louis George Cafe', sans-serif" }}
          >
            Sartorial Integrity
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-white max-w-2xl mx-auto font-normal leading-relaxed tracking-wide">
            Crafting a new standard in luxury menswear. Impeccable tailoring, sustainable small-batch production, and raw material purity.
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 md:py-28 bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[var(--accent)] text-xs uppercase tracking-[0.2em] font-semibold block">
                Philosophy
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-[var(--text)] tracking-tight leading-tight">
                We believe in garments that tell <span className="font-semibold text-[var(--primary)]">a quiet story</span>.
              </h2>
            </div>
            <div className="lg:col-span-7 text-sm sm:text-base text-[var(--text)] space-y-6 font-normal leading-relaxed">
              <p>
                In an era dominated by hyper-consumption, fast-fashion trends, and disposable craftsmanship, AVORA stands for deliberate restraint. We design menswear for the modern gentleman who values origin, quality, and the story behind every stitch.
              </p>
              <p>
                Each piece in our shirt and knitwear collection begins its life in heritage family mills. We select only the highest grade of organic cotton and long-staple flax linen. By manufacturing in micro-batches, we eradicate deadstock inventory entirely. This means our creations remain truly exclusive, highly valued, and light on our planet.
              </p>
              <div className="pt-4 border-t border-[var(--border)] flex flex-wrap gap-8 items-center">
                <div>
                  <h4 className="text-2xl font-bold text-[var(--primary)]">100%</h4>
                  <p className="text-xs uppercase tracking-wider text-[var(--text)] font-semibold">Ethical Tailoring</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-[var(--primary)]">5-100</h4>
                  <p className="text-xs uppercase tracking-wider text-[var(--text)] font-semibold">Batch Sizes</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-[var(--primary)]">0%</h4>
                  <p className="text-xs uppercase tracking-wider text-[var(--text)] font-semibold">Plastic Packaging</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 md:py-28 bg-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          <div className="text-center space-y-4">
            <span className="text-[var(--accent)] text-xs uppercase tracking-[0.2em] font-semibold block">
              Our Principles
            </span>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--primary)]">
              The AVORA Standard
            </h2>
            <p className="text-sm md:text-base text-[var(--text)] max-w-xl mx-auto font-normal">
              We govern every decision we make by a strict set of environmental and artisanal commitments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((val, idx) => (
              <div 
                key={idx}
                className="bg-[var(--surface)] p-8 border border-[var(--border)]  shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="text-4xl text-[var(--accent)]">{val.icon}</div>
                  <h3 className="text-xl font-medium text-[var(--primary)]">
                    {val.title}
                  </h3>
                  <p className="text-sm text-[var(--text)] font-normal leading-relaxed">
                    {val.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Artisanal Journey Banner */}
      <section className="relative py-24 bg-[var(--primary)] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c86f49_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative max-w-5xl mx-auto px-4 text-center space-y-6">
          <span className="text-[var(--accent)] text-xs uppercase tracking-[0.3em] font-semibold block">
            Craftsmanship
          </span>
          <h2 className="text-2xl sm:text-4xl font-normal tracking-tight leading-tight">
            "Tailoring is not merely assembly. It is the architectural alignment of raw fiber, human touch, and enduring grace."
          </h2>
          <div className="h-[2px] w-12 bg-[var(--accent)] mx-auto"></div>
          <p className="text-xs uppercase tracking-widest text-white font-semibold">
            Avora Design Atelier, Porto
          </p>
        </div>
      </section>

      {/* Sustainable Innovation Grid */}
      <section className="py-20 md:py-28 bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[var(--accent)] text-xs uppercase tracking-[0.2em] font-semibold block">
                Mindful Living
              </span>
              <h2 className="text-3xl md:text-4xl font-normal text-[var(--primary)] tracking-tight">
                Designed to fit <span className="font-semibold text-[var(--text)]">both body and planet</span>.
              </h2>
              <p className="text-sm sm:text-base text-[var(--text)] font-normal leading-relaxed">
                Sustainability is not an afterthought or a marketing claim at AVORA; it is the cornerstone of our engineering. We research raw fibers, textile finishing methods, and recycling processes to deliver shirts that stay immaculate with minimal water and energy usage.
              </p>
            </div>
            
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {features.map((feat, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-[var(--accent)]  flex-shrink-0"></span>
                    <h4 className="text-lg font-medium text-[var(--primary)]">{feat.title}</h4>
                  </div>
                  <p className="text-sm text-[var(--text)] font-normal leading-relaxed pl-4.5">
                    {feat.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[var(--bg)] border-t border-[var(--border)] text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-8">
          <h2 className="text-3xl md:text-5xl font-normal text-[var(--primary)] tracking-tight">
            Discover the Collection
          </h2>
          <p className="text-sm sm:text-base text-[var(--text)] font-normal max-w-xl mx-auto">
            Experience the natural touch of organic linen and premium hand-tailored cotton shirts made for the discerning modern gentleman.
          </p>
          <div className="pt-4">
            <Link 
              to="/store"
              className="inline-block px-10 py-4 bg-[var(--primary)] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[var(--accent)] hover:shadow-xl transition-all duration-300 transform hover:scale-102"
              style={{ letterSpacing: '0.2em' }}
            >
              Shop Atelier
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
