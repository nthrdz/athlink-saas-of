"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Users, X, ExternalLink } from "lucide-react"

interface Sponsor {
  id: string
  name: string
  logoUrl?: string | null
  websiteUrl?: string | null
  promoCode?: string | null
}

interface GlassSponsorsGridProps {
  sponsors: Sponsor[]
  showAll?: boolean
}

export function GlassSponsorsGrid({ sponsors, showAll = false }: GlassSponsorsGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const displayedSponsors = showAll ? sponsors : sponsors.slice(0, 4)
  const hasMore = sponsors.length > 4

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {displayedSponsors.map((sponsor, index) => (
          <SponsorCard
            key={sponsor.id}
            sponsor={sponsor}
            index={index}
          />
        ))}
      </div>

      {/* Bouton "Voir tous" si plus de 4 sponsors */}
      {hasMore && !showAll && (
        <motion.button
          onClick={() => setIsModalOpen(true)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-3 w-full bg-white/5 hover:bg-white/10 rounded-lg p-3 border border-white/20 hover:border-white/30 transition-all flex items-center justify-center gap-2 text-white text-sm font-medium"
        >
          <Users className="w-4 h-4" />
          Voir tous les sponsors ({sponsors.length})
        </motion.button>
      )}

      {/* Modal pour afficher tous les sponsors */}
      <AnimatePresence>
        {isModalOpen && (
          <SponsorsModal
            sponsors={sponsors}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function SponsorCard({ sponsor, index }: { sponsor: Sponsor; index: number }) {
  return (
    <motion.a
      href={sponsor.websiteUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      className="bg-white/5 hover:bg-white/10 rounded-lg p-3 border border-white/10 transition-all text-center group"
    >
      {sponsor.logoUrl ? (
        <div className="w-8 h-8 mx-auto mb-2 rounded-full overflow-hidden">
          <Image
            src={sponsor.logoUrl}
            alt={sponsor.name}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-8 h-8 mx-auto mb-2 bg-purple-500 rounded-full flex items-center justify-center">
          <Users className="w-4 h-4 text-white" />
        </div>
      )}
      <p className="font-medium text-white text-xs group-hover:text-purple-300">{sponsor.name}</p>
      {sponsor.promoCode && (
        <p className="text-gray-400 text-xs mt-1">{sponsor.promoCode}</p>
      )}
    </motion.a>
  )
}

function SponsorsModal({ sponsors, onClose }: { sponsors: Sponsor[]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-2xl bg-black/80 p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        onClick={onClose}
        className="absolute top-4 right-4 z-10 backdrop-blur-xl bg-white/20 hover:bg-white/30 border border-white/40 p-3 rounded-2xl transition-colors"
      >
        <X className="w-5 h-5 text-white" />
      </motion.button>

      {/* Modal content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Tous les sponsors</h2>
            <p className="text-gray-300 text-sm">{sponsors.length} sponsors partenaires</p>
          </div>

          {/* Grid de tous les sponsors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {sponsors.map((sponsor, index) => (
              <motion.a
                key={sponsor.id}
                href={sponsor.websiteUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className="bg-white/5 hover:bg-white/15 rounded-xl p-4 border border-white/10 hover:border-white/30 transition-all text-center group relative"
              >
                {/* Logo */}
                {sponsor.logoUrl ? (
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-white/10">
                    <Image
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                )}

                {/* Nom du sponsor */}
                <p className="font-semibold text-white text-sm mb-1 group-hover:text-purple-300 transition-colors">
                  {sponsor.name}
                </p>

                {/* Code promo */}
                {sponsor.promoCode && (
                  <div className="mt-2 bg-green-500/20 border border-green-400/30 rounded-lg px-2 py-1">
                    <p className="text-green-300 text-xs font-mono">{sponsor.promoCode}</p>
                  </div>
                )}

                {/* Indicateur de lien externe */}
                {sponsor.websiteUrl && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1">
                      <ExternalLink className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
