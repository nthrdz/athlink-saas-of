# 🎁 Codes Promo Athlink

## Codes Promo Actifs

### 1. **ELITE2025** - Accès ELITE Permanent ⭐
- **Type**: Upgrade permanent
- **Plan**: ELITE
- **Durée**: Illimitée
- **Avantages**:
  - Analytics illimitées avec heatmap GitHub
  - Services de coaching complets
  - Toutes les fonctionnalités débloquées
  - Aucune limite sur liens, sponsors, compétitions, médias

**Comment l'utiliser**:
1. Aller sur la page "Upgrade" (`/dashboard/upgrade`)
2. Entrer le code `ELITE2025` dans le champ "Code promo"
3. Cliquer sur "Valider le code"
4. Votre plan sera immédiatement mis à jour vers ELITE

---

### 2. **PRO30FREE** - 1 Mois PRO Offert 🎁
- **Type**: Trial avec expiration automatique
- **Plan**: PRO
- **Durée**: 30 jours
- **Avantages temporaires**:
  - Analytics 7 derniers jours
  - Pas de coaching (ELITE uniquement)
  - Jusqu'à 20 liens, 10 sponsors, 10 compétitions, 20 médias

**Important** ⚠️:
- Après 30 jours, votre compte **rebascule automatiquement** en plan **FREE**
- Vous recevrez un email avant l'expiration (à implémenter)
- Aucun paiement requis

**Comment l'utiliser**:
1. Aller sur la page "Upgrade" (`/dashboard/upgrade`)
2. Entrer le code `PRO30FREE` dans le champ "Code promo"
3. Cliquer sur "Valider le code"
4. Votre plan sera mis à jour vers PRO jusqu'au [date d'expiration]
5. À la fin de la période, retour automatique au plan FREE

---

## Gestion des Trials

### Vérification Automatique de l'Expiration
Le système vérifie automatiquement l'expiration des trials de deux façons :

1. **En temps réel** : Quand un utilisateur se connecte, le système vérifie si son trial a expiré
2. **API Cron** : Route `/api/cron/expire-trials` (à configurer avec Vercel Cron ou autre)

### Configuration du Cron Job (Vercel)
Ajouter dans `vercel.json` :
```json
{
  "crons": [{
    "path": "/api/cron/expire-trials",
    "schedule": "0 */6 * * *"
  }]
}
```
Cette configuration exécute le script toutes les 6 heures.

### Sécurité de l'API Cron
⚠️ **OBLIGATOIRE** : L'API est protégée par un secret. Sans ce secret, l'API cron **ne fonctionnera pas** (erreur 503).

Ajouter dans vos secrets Replit :
```
CRON_SECRET=votre_secret_aleatoire_genere
```

Générer un secret sécurisé :
```bash
openssl rand -base64 32
```

Pour tester manuellement l'expiration :
```bash
curl -H "Authorization: Bearer votre_secret" \
  https://votre-domaine.com/api/cron/expire-trials
```

---

## Codes Promo Legacy (Désactivés)

### ~~ATHLINK_PREMIUM~~ ❌
- Remplacé par ELITE2025
- Conservé dans le code pour compatibilité

### ~~ATHLINK100~~ ❌
- Remplacé par PRO30FREE
- Meilleur système d'expiration automatique

---

## Support Technique

### Ajout d'un Nouveau Code Promo
Éditer `lib/promo-codes.ts` :
```typescript
export const PROMO_CODES: Record<string, PromoCode> = {
  "NOUVEAU_CODE": {
    type: "plan_upgrade" | "trial",
    plan: "PRO" | "ELITE",
    duration: null | 30,  // null = permanent, nombre = jours
    discount: 0 | 100,    // 0 = aucun, 100 = gratuit
    description: "Description du code"
  }
}
```

### Désactivation d'un Code
Simplement le retirer de `PROMO_CODES` dans `lib/promo-codes.ts`.

---

**Dernière mise à jour** : 25 octobre 2025
