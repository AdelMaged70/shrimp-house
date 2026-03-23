import Link from 'next/link'
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-primary text-foreground mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="text-3xl">🦐</div>
              <div>
                <h3 className="text-xl font-bold">Shrimp House</h3>
                <p className="text-sm opacity-80">شريمب هاوس</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed opacity-90">
              أفضل مطعم مأكولات بحرية في مصر. نقدم أطباق بحرية طازجة ولذيذة مع
              خدمة ممتازة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="hover:text-primary transition-colors"
                >
                  القائمة
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-primary transition-colors"
                >
                  السلة
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="hover:text-primary transition-colors"
                >
                  الطلب
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">تواصل معنا</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-foreground" />
                <span>+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-foreground" />
                <span>info@shrimphouse.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-foreground" />
                <span>فروعنا في دسوق، الإسكندرية، القاهرة</span>
              </li>
            </ul>

            {/* Social Media */}
            <div className="flex gap-3 mt-4">
              <a
                href="#"
                className="h-9 w-9 rounded-full bg-primary-foreground text-primary flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-9 w-9 rounded-full bg-primary-foreground text-primary flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 text-center text-sm opacity-80">
          <p>© 2026 Shrimp House. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}
