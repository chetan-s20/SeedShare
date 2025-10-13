import Link from 'next/link'
import { Sparkles, Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 dark:bg-green-700">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">SeedShare</span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Building a unified digital ecosystem for seed sharing, expert guidance, and certified
              seed sales.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/library" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                  Seed Library
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/knowledge" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                  Knowledge Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                  Growing Guides
                </Link>
              </li>
              <li>
                <Link href="/experts" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                  Expert Consultation
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/seeds-act" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                  Seeds Act Compliance
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                  Contact Us
                </Link>
              </li>
            </ul>
            <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4" />
              <a href="mailto:support@seedshare.com" className="hover:text-green-600 dark:hover:text-green-400">
                support@seedshare.com
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t dark:border-gray-800 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} SeedShare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
