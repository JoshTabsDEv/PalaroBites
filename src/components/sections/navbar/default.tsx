"use client"

import { Menu, User, LogOut } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import LaunchUI from "../../logos/launch-ui";
import { Button, type ButtonProps } from "../../ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "../../ui/navbar";
import Navigation from "../../ui/navigation";
import { Sheet, SheetContent, SheetTrigger } from "../../ui/sheet";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import CartButton from "@/components/cart/cart-button";

interface NavbarLink {
  text: string;
  href: string;
}

interface NavbarActionProps {
  text: string;
  href: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
  isButton?: boolean;
}

interface NavbarProps {
  logo?: ReactNode;
  name?: string;
  homeUrl?: string;
  mobileLinks?: NavbarLink[];
  actions?: NavbarActionProps[];
  showNavigation?: boolean;
  customNavigation?: ReactNode;
  className?: string;
}

export default function Navbar({
  logo = <img src="/logo.png" alt="Programmers Guild" className="h-8 w-8 md:h-10 md:w-10 mr-2" />,
  name = "",
  homeUrl = "/",
  mobileLinks = [
    { text: "Stores", href: "/" },
    { text: "Orders", href: "/orders" },
    { text: "Profile", href: "/profile" },
  ],
  actions = [
    { text: "Sign in", href: "/login", isButton: true, variant: "dark" },
  ],
  showNavigation = true,
  customNavigation,
  className,
}: NavbarProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    // Use local scope to avoid server token revocation errors (session_not_found)
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {}
    // Optional: navigate to home after signout
    if (typeof window !== 'undefined') window.location.href = '/';
  };
  return (
    <header className={cn("sticky top-0 z-50 -mb-4 px-4 pb-4", className)}>
      <div className="fade-bottom bg-background/15 absolute left-0 h-24 w-full backdrop-blur-lg pointer-events-none"></div>
      <div className="max-w-container relative mx-auto">
        <NavbarComponent>
          <NavbarLeft>
            <a
              href={homeUrl}
              className="flex items-center gap-2 text-xl font-bold"
            >
              {logo}
              {name}
            </a>
            {showNavigation && (customNavigation || <Navigation />)}
          </NavbarLeft>
          <NavbarRight>
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <CartButton />
                <Button asChild variant="outline" size="sm">
                  <a href="/orders">My Orders</a>
                </Button>
                <div className="hidden md:flex items-center gap-2 text-sm">
                  <User className="w-4 h-4" />
                  <span className="text-gray-700">{user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <CartButton />
                {actions.map((action, index) =>
                  action.isButton ? (
                    <Button
                      key={index}
                      variant={action.variant || "default"}
                      asChild
                    >
                      <a href={action.href}>
                        {action.icon}
                        {action.text}
                        {action.iconRight}
                      </a>
                    </Button>
                  ) : (
                  <a
                    key={index}
                    href={action.href}
                    className="text-sm"
                  >
                      {action.text}
                    </a>
                  ),
                )}
              </div>
            )}
            {/* Hamburger menu removed for mobile */}
          </NavbarRight>
        </NavbarComponent>
      </div>
    </header>
  );
}

    