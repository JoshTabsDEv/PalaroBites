import { GalleryVerticalEnd } from "lucide-react"
import Image from "next/image";

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
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
      </div>
    </div>
  )
}
