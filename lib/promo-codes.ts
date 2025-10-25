export interface PromoCode {
  type: "plan_upgrade" | "trial"
  plan: string
  duration: number | null
  discount: number
  description: string
}

export const PROMO_CODES: Record<string, PromoCode> = {
  "ATHLINK_PREMIUM": {
    type: "plan_upgrade",
    plan: "PRO",
    duration: null,
    discount: 100,
    description: "Accès complet à toutes les fonctionnalités (PRO)"
  },
  "ELITE2025": {
    type: "plan_upgrade",
    plan: "ELITE",
    duration: null,
    discount: 0,
    description: "Accès ELITE permanent - Toutes les fonctionnalités débloquées"
  },
  "PRO30FREE": {
    type: "trial",
    plan: "PRO", 
    duration: 30,
    discount: 100,
    description: "1 mois PRO offert - Rebascule automatiquement en plan gratuit après 30 jours"
  }
}
