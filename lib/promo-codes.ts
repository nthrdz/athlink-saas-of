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
  "ELITE": {
    type: "plan_upgrade",
    plan: "ELITE",
    duration: null,
    discount: 0,
    description: "Accès Pro complet"
  },
  "ATHLINK100": {
    type: "trial",
    plan: "ELITE", 
    duration: 30,
    discount: 0,
    description: "1 mois offert Pro"
  }
}
