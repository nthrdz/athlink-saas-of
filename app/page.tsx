"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Award, 
  Calendar, 
  Target,
  ArrowRight,
  Check,
  Zap,
  Instagram
} from "lucide-react"

// Composant carrousel pour les athlètes
function AthleteCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const athletes = [
    { name: 'Noa', handle: '@noa', image: '/uploads/hero/noa.png' },
    { name: 'Nathan', handle: '@nathan', image: '/uploads/hero/nathan.png' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % athletes.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="w-full max-w-sm h-96 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 mb-4 overflow-hidden p-4">
          <div className="w-full h-full relative">
            <Image
              src={athletes[currentIndex].image}
              alt={athletes[currentIndex].name}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
        <p className="text-lg text-gray-700 font-medium mb-1">{athletes[currentIndex].name}</p>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <Instagram className="w-4 h-4" />
          {athletes[currentIndex].handle}
        </p>
      </motion.div>
    </div>
  )
}

export default function Home() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section - GetAllMyLinks Style */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            {/* Personas badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap gap-3 justify-center mb-8"
            >
              {['Runners', 'Cyclistes', 'Triathlètes', 'Crossfit', 'Fitness'].map((persona, i) => (
                <span 
                  key={i}
                  className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                >
                  {persona}
                </span>
              ))}
            </motion.div>

            {/* Main title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Le link-in-bio #1 pour athlètes
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-3xl mx-auto"
            >
              Tout ce dont tu as besoin pour partager tes performances, trouver des sponsors, et développer ta communauté. Le tout dans un seul lien.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800 px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition-all hover:scale-105"
              >
                Commencer gratuitement
                <ArrowRight className="w-5 h-5" />
              </Link>
              <span className="text-sm text-gray-500">100% gratuit</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof - Athletes Carousel */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-lg text-gray-600">
              Rejoins nos athlètes qui utilisent Athlink pour développer leur communauté
            </p>
          </motion.div>

          {/* Carousel automatique */}
          <AthleteCarousel />
        </div>
      </section>

      {/* Key Figures - Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Les objectifs à avoir
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                number: "1,000+",
                label: "Athlètes",
                description: "Plus de 1000 athlètes nous font confiance pour gérer leur présence en ligne"
              },
              {
                number: "500K+",
                label: "Vues/mois",
                description: "Chaque mois, plus d'un demi-million de visiteurs cliquent sur les profils de nos athlètes"
              },
              {
                number: "50K+",
                label: "Clics sponsors",
                description: "Des milliers de clics générés vers les sponsors et partenaires chaque mois"
              }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center"
              >
                <div className="text-5xl sm:text-6xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-xl font-semibold text-gray-700 mb-3">
                  {stat.label}
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {stat.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Simplified */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tout ce dont un athlète a besoin
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Conçu spécifiquement pour les sportifs, avec des fonctionnalités uniques
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: "Stats & Performance",
                description: "Synchronise Strava, affiche tes records, graphiques de progression en temps réel"
              },
              {
                icon: Calendar,
                title: "Calendrier Courses",
                description: "Countdown jusqu'à ta prochaine course, résultats automatiques, historique complet"
              },
              {
                icon: Users,
                title: "Sponsors & Partenaires",
                description: "Section dédiée avec tracking des clics, analytics pour tes sponsors"
              },
              {
                icon: Award,
                title: "Galerie Média",
                description: "Photos, vidéos, highlights de tes meilleures performances en action"
              },
              {
                icon: Target,
                title: "Services Coaching",
                description: "Vends tes plans d'entraînement, gère tes bookings, développe ton business"
              },
              {
                icon: TrendingUp,
                title: "Analytics Pro",
                description: "Vois qui visite ton profil, quels liens performent, optimise ta stratégie"
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="inline-flex p-3 rounded-xl bg-gray-900 mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="tarifs" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Des plans adaptés à tes besoins
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Choisis le plan qui correspond le mieux à tes objectifs
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-4 p-1 bg-gray-100 rounded-full">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  billingCycle === "yearly"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Annuel
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  2 mois offerts
                </span>
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "FREE",
                monthlyPrice: 0,
                yearlyPrice: 0,
                description: "Pour débuter et tester la plateforme",
                features: [
                  "1 profil public",
                  "Liens illimités",
                  "Galerie photos & vidéos",
                  "Réseaux sociaux",
                  "Calendrier courses",
                  "Analytics basiques uniquement",
                  "Pas de domaine personnalisé",
                  "Pas de CSS personnalisé",
                  "Branding Athlink visible"
                ],
                cta: "Commencer",
                popular: false
              },
              {
                name: "PRO",
                monthlyPrice: 9.90,
                yearlyPrice: 8.25,
                description: "Pour les athlètes sérieux",
                features: [
                  "Tout FREE +",
                  "Liens, compétitions, sponsors et médias illimités",
                  "Analytics avancées (7 jours)",
                  "Badge \"Pro\" sur le profil",
                  "Pas de pubs",
                  "Support prioritaire"
                ],
                cta: "Essayer PRO",
                popular: true
              },
              {
                name: "ELITE",
                monthlyPrice: 25.90,
                yearlyPrice: 21.58,
                description: "Pour les professionnels",
                features: [
                  "Tout PRO +",
                  "Analytics illimitées",
                  "Heatmap de clics",
                  "Démographie des visiteurs",
                  "Services coaching",
                  "CSS personnalisé",
                  "Badge Elite sur le profil",
                  "Support prioritaire"
                ],
                cta: "Essayer ELITE",
                popular: false
              }
            ].map((plan, i) => {
              const displayPrice = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice
              const yearlySavings = plan.monthlyPrice > 0 
                ? ((plan.monthlyPrice - plan.yearlyPrice) * 12).toFixed(2)
                : null
              
              return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-white rounded-2xl p-8 ${
                  plan.popular
                    ? "border-2 border-gray-900 shadow-xl"
                    : "border border-gray-200 shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Plus populaire
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900">
                      {displayPrice}€
                    </span>
                    {displayPrice > 0 && (
                      <span className="text-gray-600">/mois</span>
                    )}
                  </div>
                  {billingCycle === "yearly" && yearlySavings && (
                    <p className="text-sm text-green-600 mt-2">
                      Économise {yearlySavings}€/an
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`block w-full text-center py-3 rounded-full font-semibold transition-all ${
                    plan.popular
                      ? "bg-gray-900 text-white hover:bg-gray-800"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer - Politiques légales */}
      <footer className="py-12 bg-gray-900 text-white border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Colonne 1 - À propos */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Athlink</h3>
              <p className="text-sm text-gray-400">
                La plateforme link-in-bio dédiée aux athlètes pour développer leur présence en ligne.
              </p>
            </div>

            {/* Colonne 2 - Produit */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
                <li><Link href="#tarifs" className="hover:text-white transition-colors">Tarifs</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Créer un compte</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Se connecter</Link></li>
              </ul>
            </div>

            {/* Colonne 3 - Légal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a 
                    href="https://www.iubenda.com/privacy-policy/27659887" 
                    className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe hover:text-white transition-colors" 
                    title="Politique de confidentialité"
                  >
                    Politique de Confidentialité
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.iubenda.com/privacy-policy/27659887/cookie-policy" 
                    className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe hover:text-white transition-colors" 
                    title="Politique relative aux Cookies"
                  >
                    Politique relative aux Cookies
                  </a>
                </li>
                <li><a href="/legal/CGV.pdf" target="_blank" className="hover:text-white transition-colors">CGV</a></li>
                <li><a href="/legal/Mentions_Legales.pdf" target="_blank" className="hover:text-white transition-colors">Mentions légales</a></li>
              </ul>
            </div>

            {/* Colonne 4 - Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Centre d'aide</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Nous contacter</Link></li>
                <li><a href="mailto:support@athlink.com" className="hover:text-white transition-colors">support@athlink.com</a></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 Athlink. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
