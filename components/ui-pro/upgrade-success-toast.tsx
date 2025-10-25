"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

export function UpgradeSuccessToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  useEffect(() => {
    const upgrade = searchParams.get("upgrade")
    const plan = searchParams.get("plan")
    
    if (upgrade === "success" && plan) {
      toast.success(`🎉 Plan ${plan} activé avec succès !`, {
        description: "Actualisation de votre profil...",
        duration: 3000,
      })
      
      // Nettoyer l'URL et recharger la page pour afficher les nouvelles fonctionnalités
      window.history.replaceState({}, "", "/dashboard")
      
      // Recharger la page après 1.5 secondes pour voir les changements
      setTimeout(() => {
        router.refresh()
        toast.success("Toutes vos nouvelles fonctionnalités sont maintenant disponibles ! 🚀")
      }, 1500)
    }
  }, [searchParams, router])
  
  return null
}
