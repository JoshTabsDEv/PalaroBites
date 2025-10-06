import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  const sections = [
    { id: "story", title: "Our Story" },
    { id: "mission", title: "Mission" },
    { id: "vision", title: "Vision" },
    { id: "whatwedo", title: "What We Do" },
    { id: "values", title: "Our Core Values" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div id="top" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-6 w-1.5 rounded bg-rose-500" />
            <h1 className="text-3xl font-bold">About the Programmers Guild</h1>
          </div>
          <p className="text-sm text-muted-foreground">Community • Collaboration • Craft</p>
        </div>

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
            <section className="rounded-xl border bg-card p-6 flex items-center gap-4">
              <Image src="/logo.png" alt="Guild logo" width={56} height={56} className="h-14 w-14 rounded-md" />
              <div>
                <p className="text-sm text-muted-foreground">A student‑led / community‑driven initiative for developers.</p>
                
              </div>
            </section>

            <section id="story" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">Our Story</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Born from meetups and hack nights, the Guild emerged as a hub for programmers who wanted a welcoming
                space to learn, build, and mentor. What began as small collaborations has grown into a network of
                contributors, student chapters, and industry mentors working together on open projects and community events.
              </p>
            </section>

            <section id="mission" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">Mission</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The mission of the Programmers Guild is to empower, connect, and support programmers in their professional
                development and collaboration, while advocating for diversity, inclusion, and ethical innovation within the tech industry.
              </p>
            </section>

            <section id="vision" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">Vision</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To be the premier global community empowering programmers and tech enthusiasts to innovate, collaborate,
                and thrive in the ever‑evolving digital landscape.
              </p>
            </section>

            <section id="whatwedo" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">What We Do</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
                <li>Workshops & study groups (web, mobile, data, infra)</li>
                <li>Open‑source projects and community tooling</li>
                <li>Career mentoring and peer portfolio reviews</li>
                <li>Collaboration with schools, clubs, and local dev orgs</li>
              </ul>
            </section>

            <section id="values" className="rounded-xl border bg-card p-6">
              <h2 className="text-xl font-semibold mb-2">Our Core Values</h2>
              <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-5 space-y-1">
                <li>Community first — welcoming, supportive, inclusive</li>
                <li>Transparency — open collaboration and shared learning</li>
                <li>Craft — continuous improvement and engineering excellence</li>
                <li>Impact — building useful tools with ethical intent</li>
              </ul>
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


