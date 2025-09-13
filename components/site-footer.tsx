import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Niger State Projects" className="w-60" />
            </div>
            <p className="text-sm text-primary-foreground/80 text-pretty">
              Promoting transparency and accountability in development projects across all 274 wards in Niger State.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"><Instagram className="h-5 w-5" /></Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Home</Link></li>
              <li><Link href="/projects" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">All Projects</Link></li>
              <li><Link href="/about" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Contact</Link></li>
              <li><Link href="/subscribe" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Subscribe for Updates</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Project Categories</h3>
            <ul className="space-y-2">
              <li><Link href="/projects?category=infrastructure" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Infrastructure</Link></li>
              <li><Link href="/projects?category=education" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Education</Link></li>
              <li><Link href="/projects?category=healthcare" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Healthcare</Link></li>
              <li><Link href="/projects?category=water" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Water Projects</Link></li>
              <li><Link href="/projects?category=agriculture" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Agriculture</Link></li>
              <li><Link href="/projects?category=roads" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Roads</Link></li>
              <li><Link href="/projects?category=electricity" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Electricity</Link></li>
              <li><Link href="/projects?category=housing" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Housing</Link></li>
              <li><Link href="/projects?category=environment" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Environment</Link></li>
              <li><Link href="/projects?category=social" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Social Programs</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3"><MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" /><p className="text-sm text-primary-foreground/80">Niger State Government House,<br />Minna, Niger State, Nigeria</p></div>
              <div className="flex items-center space-x-3"><Phone className="h-5 w-5 flex-shrink-0" /><p className="text-sm text-primary-foreground/80">+234 (0) 66 220 123</p></div>
              <div className="flex items-center space-x-3"><Mail className="h-5 w-5 flex-shrink-0" /><p className="text-sm text-primary-foreground/80">info@nigerprojects.gov.ng</p></div>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Subscribe for Updates</h3>
            <p className="text-sm text-primary-foreground/80">Get quarterly email updates about new and ongoing development projects in your area.</p>
            <Link href="/subscription" className="inline-block mt-2 px-4 py-2 bg-primary-foreground text-primary rounded font-semibold hover:bg-primary-foreground/80 transition-colors">Subscribe Now</Link>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-primary-foreground/80">© 2025 Niger State Development Platform. All rights reserved.</p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
