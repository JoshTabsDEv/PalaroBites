import Link from "next/link";

export default function TermsPage() {
  const sections = [
    { id: "overview", title: "Overview" },
    { id: "eligibility", title: "Eligibility" },
    { id: "accounts", title: "Accounts" },
    { id: "orders", title: "Orders & Payments" },
    { id: "cancellations", title: "Cancellations & Refunds" },
    { id: "acceptable", title: "Acceptable Use" },
    { id: "privacy", title: "Privacy" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div id="top" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-6 w-1.5 rounded bg-rose-500" />
            <h1 className="text-3xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-sm text-muted-foreground">Effective date: {new Date().toLocaleDateString()}</p>
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
              <p className="font-medium">Important</p>
              <p className="text-sm">PalaroBites is intended for on‑campus food delivery. Misuse of the service may result in order cancellation and/or account restriction.</p>
            </section>

            <section id="overview" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">1. Overview</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By accessing or using PalaroBites (the “Platform”), you agree to be bound by these Terms of Service (the “Terms”).
                If you do not agree to these Terms, do not use the Platform.
              </p>
            </section>

            <section id="eligibility" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">2. Eligibility</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You must be able to form a legally binding contract and follow your school’s policies. The Platform is designed
                for use within the campus service area only.
              </p>
            </section>

            <section id="accounts" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">3. Accounts</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
                <li>You are responsible for the accuracy of your account information.</li>
                <li>Keep your credentials secure and notify us of any unauthorized use.</li>
              </ul>
            </section>

            <section id="orders" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">4. Orders & Payments</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
                <li>All orders are subject to store availability and acceptance.</li>
                <li>A flat delivery fee of ₱5 applies to each order unless otherwise stated.</li>
                <li>Cash on Delivery (CoD) is the primary payment method. Have exact cash when possible.</li>
              </ul>
            </section>

            <section id="cancellations" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">5. Cancellations & Refunds</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
                <li>Orders may be cancelled due to store unavailability or invalid drop‑off details.</li>
                <li>Refunds (if applicable) are handled by the respective store according to its policy.</li>
              </ul>
            </section>

            <section id="acceptable" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">6. Acceptable Use</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
                <li>Do not misuse the Platform (e.g., fraudulent orders, disruptive behavior).</li>
                <li>Provide accurate building/room information for delivery.</li>
              </ul>
            </section>

            <section id="privacy" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">7. Privacy</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We process minimal personal data to fulfill orders. See our privacy notice (coming soon) for details on data
                collection and retention.
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


