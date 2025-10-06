import Link from "next/link";

export default function PrivacyPage() {
  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "collection", title: "Information We Collect" },
    { id: "use", title: "How We Use Information" },
    { id: "sharing", title: "Data Sharing & Disclosure" },
    { id: "security", title: "Data Security" },
    { id: "retention", title: "Data Retention" },
    { id: "rights", title: "Your Privacy Rights" },
    { id: "contact", title: "Contact" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div id="top" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-6 w-1.5 rounded bg-rose-500" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 rounded-xl border bg-card p-4">
              <p className="text-sm font-semibold mb-3">On this page</p>
              <nav className="space-y-2">
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className="block text-sm text-muted-foreground hover:text-foreground">
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-9 space-y-8">
            <section className="rounded-xl border border-rose-200/60 bg-rose-50/60 p-4 text-rose-900">
              <p className="font-medium">Your Privacy Matters</p>
              <p className="text-sm">We protect your personal data in compliance with the Data Privacy Act of 2012 (RA 10173).</p>
            </section>

            <section id="introduction" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">Introduction</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This Privacy Policy explains how PalaroBites (the “Platform”) collects, uses, stores, and shares
                information when you use our services. By using the Platform, you consent to the practices described here.
              </p>
            </section>

            <section id="collection" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
              <h3 className="text-sm font-semibold mb-1">1) Information you provide</h3>
              <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1 mb-3">
                <li>Contact details (name, email, phone)</li>
                <li>Delivery address and instructions</li>
                <li>Profile details (optional)</li>
              </ul>
              <h3 className="text-sm font-semibold mb-1">2) Information collected automatically</h3>
              <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1 mb-3">
                <li>Device and usage data (browser, pages viewed)</li>
                <li>Approximate location (IP‑based or when granted)</li>
                <li>Cookies/local storage for session and preferences</li>
              </ul>
              <h3 className="text-sm font-semibold mb-1">3) Third‑party services</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We may use mapping, analytics, and authentication providers. Their use of data is governed by their policies.
              </p>
            </section>

            <section id="use" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">How We Use Information</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
                <li>Process orders and coordinate delivery</li>
                <li>Authenticate accounts and prevent fraud/abuse</li>
                <li>Improve features and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section id="sharing" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">Data Sharing & Disclosure</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
                <li>Partner stores and delivery staff (only what is needed to fulfill your order)</li>
                <li>Service providers (e.g., analytics, hosting) under contractual safeguards</li>
                <li>Legal requirements (e.g., lawful requests, prevention of harm)</li>
                <li>We do <strong>not</strong> sell personal data</li>
              </ul>
            </section>

            <section id="security" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">Data Security</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use reasonable technical and organizational measures, including HTTPS/TLS encryption, access controls,
                and regular reviews. No system is perfectly secure—avoid submitting highly sensitive data.
              </p>
            </section>

            <section id="retention" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">Data Retention</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
                <li>Keep operational data as needed to provide the service</li>
                <li>Delete or anonymize personal identifiers when no longer necessary</li>
                <li>Retain longer when required by law, disputes, or fraud prevention</li>
              </ul>
            </section>

            <section id="rights" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">Your Privacy Rights</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
                <li>Access, correction, deletion (subject to legal limits)</li>
                <li>Object to processing and withdraw consent</li>
                <li>Data portability (structured, machine‑readable format)</li>
              </ul>
            </section>

            <section id="contact" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">Contact</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                For privacy requests, message us via our official page or contact the PalaroBites team. We respond within a
                reasonable time consistent with applicable law.
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Reference style inspired by Kuyog Cebu privacy layout
                (<Link href="https://kuyogcebu.com/privacy" className="underline underline-offset-4" target="_blank">kuyogcebu.com/privacy</Link>).
              </p>
            </section>

            <div className="flex items-center justify-between pt-2">
              <Link href="/" className="text-sm underline underline-offset-4">Go back home</Link>
              <a href="#top" className="text-sm underline underline-offset-4">Back to top</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

