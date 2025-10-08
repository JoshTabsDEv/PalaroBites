'use client'
import { useEffect, useState } from "react";
import { GalleryVerticalEnd, AlertTriangle } from "lucide-react"
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  const [introOpen, setIntroOpen] = useState(false);
  const [introStep, setIntroStep] = useState(0);

  useEffect(() => {
    try {
      const seen = typeof window !== 'undefined' ? localStorage.getItem('introSeen') : 'true';
      if (!seen) setIntroOpen(true);
    } catch {}
  }, []);

  const introSteps: { title: string; desc: string }[] = [
    { title: "Welcome to PalaroBites", desc: "Browse verified campus stores. Delivery starts at ₱5 for first 3 items, then ₱5 for every additional 3 items." },
    { title: "Add to Cart", desc: "Tap Add to Cart on any product. Edit quantities from the cart in the header." },
    { title: "Cash on Delivery", desc: "Checkout and pay in cash. Track your order in My Orders—your rider will call on arrival." },
  ];

  const closeIntro = () => {
    setIntroOpen(false);
    try { localStorage.setItem('introSeen', '1'); } catch {}
  };
  return (
   <div className="relative min-h-screen flex flex-col items-center justify-center gap-8 p-6 md:p-10 bg-gray-100">
      {/* Optional Hero Background */}
      {/* <Image
        src="/hero.jpg"
        alt="Palaro Bites Background"
        fill
        className="object-cover z-0"
        priority
      /> */}
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center gap-6">
        <a
          href="#"
          className="flex items-center gap-3 self-center font-semibold text-lg md:text-xl"
        >
          <Image
            src="/logo.png"
            alt="Palaro Bites Logo"
            width={40} // Larger for visibility
            height={40}
            className="w-10 h-10 md:w-12 md:h-12" // Responsive sizing
            priority // Optimize for above-the-fold
          />
          PalaroBites
        </a>
        <LoginForm className="w-full" />
        {/* Introductory progressive modal */}
        <Dialog open={introOpen} onOpenChange={(o) => { if (!o) closeIntro(); }}>
          <DialogContent className="w-[92vw] sm:w-[32rem] md:max-w-3xl rounded-2xl border border-red-100 bg-white dark:bg-neutral-900 shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="h-6 w-1.5 rounded bg-rose-500" />
                <DialogTitle className="text-2xl">{introSteps[introStep].title}</DialogTitle>
              </div>
              <DialogDescription className="leading-relaxed text-base">
                {introSteps[introStep].desc}
              </DialogDescription>
            </DialogHeader>
            <div className="pt-2 text-sm text-muted-foreground">
              {introStep === 0 && (
                <div className="space-y-4">
                  <p>
                    Welcome to <span className="font-semibold text-rose-600">PalaroBites</span>, your campus delivery companion.
                  </p>
                  <div className="rounded-xl border border-rose-200/60 bg-rose-50/60 p-4 text-rose-900">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-rose-600 mt-0.5" />
                      <div>
                        <p className="font-medium">On‑campus only</p>
                        <p className="text-sm">Please provide accurate building/room for drop‑off.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between pt-3">
              <div className="flex gap-1">
                {introSteps.map((_, i) => (
                  <span key={i} className={`h-2 w-2 rounded-full ${i === introStep ? 'bg-foreground' : 'bg-muted'}`}></span>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={closeIntro}>Skip</Button>
                {introStep < introSteps.length - 1 ? (
                  <Button onClick={() => setIntroStep((s) => s + 1)}>Next</Button>
                ) : (
                  <Button onClick={closeIntro}>Got it</Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
