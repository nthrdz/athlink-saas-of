"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Link2, 
  Trophy, 
  Award, 
  Image as ImageIcon,
  User,
  Settings,
  LogOut,
  Share2,
  Menu,
  X,
  Users,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileNavigationProps {
  username: string
  displayName: string
  avatarUrl?: string | null
  plan?: string
  onSignOut: () => void
}

interface MenuItem {
  href: string
  icon: any
  label: string
  planRequired?: string
}

interface MenuSection {
  title?: string
  items: MenuItem[]
  collapsible?: boolean
}

export function MobileNavigation({ 
  username, 
  displayName, 
  avatarUrl,
  plan,
  onSignOut 
}: MobileNavigationProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    profil: true,
    sources: true
  })

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const menuStructure: MenuSection[] = [
    {
      items: [
        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      ]
    },
    {
      title: "Profil",
      collapsible: true,
      items: [
        { href: "/dashboard/profile", icon: User, label: "Profil" },
        { href: "/dashboard/media", icon: ImageIcon, label: "Galerie" },
      ]
    },
    {
      title: "Sources",
      collapsible: true,
      items: [
        { href: "/dashboard/links", icon: Link2, label: "Liens" },
        { href: "/dashboard/races", icon: Trophy, label: "Compétitions" },
        { href: "/dashboard/sponsors", icon: Award, label: "Sponsors" },
      ]
    },
    {
      items: [
        { href: "/dashboard/coaching", icon: Users, label: "Services Coaching", planRequired: "COACH" },
        { href: "/dashboard/share", icon: Share2, label: "Partager" },
        { href: "/dashboard/settings", icon: Settings, label: "Paramètres" },
      ]
    }
  ]

  // Filtrer les sections et items selon le plan
  const filteredMenuStructure = menuStructure.map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (!item.planRequired) return true
      if (item.planRequired === "COACH") return plan === "COACH" || plan === "ELITE" || plan === "ATHLETE_PRO"
      if (item.planRequired === "PRO") return plan === "PRO" || plan === "ELITE" || plan === "ATHLETE_PRO"
      return plan === item.planRequired
    })
  })).filter(section => section.items.length > 0)

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
            <span className="text-black font-black text-sm">A</span>
          </div>
          <span className="font-black text-xl bg-gradient-to-r from-yellow-500 via-black to-yellow-600 bg-clip-text text-transparent">
            AthLink
          </span>
        </Link>

        {/* Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Menu"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 flex flex-col shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt={displayName}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="text-black font-black text-lg">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{displayName}</h3>
                    <p className="text-sm text-gray-600">@{username}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 px-6 py-4 space-y-6">
                {filteredMenuStructure.map((section, sectionIndex) => {
                  const sectionId = section.title?.toLowerCase() || `section-${sectionIndex}`
                  const isExpanded = expandedSections[sectionId] !== false

                  return (
                    <div key={sectionId} className="space-y-2">
                      {/* Section Title */}
                      {section.title && (
                        <button
                          onClick={() => section.collapsible && toggleSection(sectionId)}
                          className={cn(
                            "w-full flex items-center justify-between px-2 py-1",
                            section.collapsible && "hover:bg-gray-50 rounded-lg cursor-pointer"
                          )}
                        >
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {section.title}
                          </span>
                          {section.collapsible && (
                            isExpanded ? (
                              <ChevronUp className="w-3 h-3 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-3 h-3 text-gray-400" />
                            )
                          )}
                        </button>
                      )}

                      {/* Section Items */}
                      {isExpanded && (
                        <div className="space-y-1">
                          {section.items.map((item) => {
                            const isActive = pathname === item.href
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                                  isActive
                                    ? "bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 text-yellow-600 border border-yellow-500/20"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                )}
                              >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </nav>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Se déconnecter
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
