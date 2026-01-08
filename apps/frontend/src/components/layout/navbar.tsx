'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notification-bell';

const navigation = [
  { name: 'Browse', href: '/browse' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Pricing', href: '/pricing' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">S</span>
          </div>
          <span className="text-xl font-bold">SocialSwapr</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-6 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === item.href
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            {/* Notifications */}
            <NotificationBell />

            {/* Messages */}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/messages">
                <MessageSquare className="h-5 w-5" />
              </Link>
            </Button>

            {/* Dashboard Link */}
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/dashboard">Dashboard</Link>
            </Button>

            {/* Clerk User Button */}
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'h-8 w-8',
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/sign-in">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </SignedOut>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <div className="container mx-auto space-y-1 px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'block rounded-md px-3 py-2 text-base font-medium',
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <SignedIn>
              <Link
                href="/dashboard"
                className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
            </SignedOut>
          </div>
        </div>
      )}
    </header>
  );
}
