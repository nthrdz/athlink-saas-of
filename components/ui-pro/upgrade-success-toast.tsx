"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function UpgradeSuccessToast() {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const upgrade = searchParams.get("upgrade")
    const plan = searchParams.get("plan")
    
    if (upgrade === "success" && plan) {
      toast.success(`🎉 Plan ${plan} activé avec succès !`, {
        description: "Ton abonnement est maintenant actif. Profite de toutes les fonctionnalités !",
        duration: 5000,
      })
      
      // Nettoyer l'URL
      window.history.replaceState({}, "", "/dashboard")
    }
  }, [searchParams])
  
  return null
}
