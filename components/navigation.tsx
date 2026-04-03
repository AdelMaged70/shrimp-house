'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function Navigation() {
  const { totalItems } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'الرئيسية', labelEn: 'Home' },
    { href: '/categories', label: 'المنيو', labelEn: 'Menu' },
    { href: '/cart', label: 'السلة', labelEn: 'Cart' },
    { href: '/reviews', label: 'التقييمات', labelEn: 'Reviews' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold">🦐</div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold">Shrimp House</span>
              <span className="text-xs opacity-90">شريمب هاوس</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:opacity-80 transition-opacity font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Cart Button */}
          <div className="flex items-center gap-2 ">
            <Link href="/cart">
              <Button variant="secondary" size="sm" className="relative gap-2 cursor-pointer">
                <ShoppingCart className="h-5 w-5 " />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
                <span className="hidden sm:inline">السلة</span>
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="secondary" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium hover:text-primary transition-colors p-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
