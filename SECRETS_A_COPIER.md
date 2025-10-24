# 🔑 Secrets à Copier pour le Déploiement athlink.fr

## ⚠️ IMPORTANT
Les secrets ci-dessous sont déjà configurés dans votre environnement de développement Replit.
Vous devez les copier MANUELLEMENT vers votre déploiement production (athlink.fr).

## 📍 Où faire ça ?

1. Dans Replit, cliquez sur le bouton **"Deploy"** (ou "Déployer")
2. Allez dans **"Settings"** → **"Environment Variables"** ou **"Secrets"**
3. Copiez-collez les secrets ci-dessous UN PAR UN

---

## 🔐 Secrets à Copier

### 1. AUTH_SECRET (OBLIGATOIRE)
**Nom de la variable :** `AUTH_SECRET`

**Valeur :** Allez dans vos **Replit Secrets** (dans la barre latérale) et copiez la valeur de `NEXTAUTH_SECRET`

---

### 2. AUTH_URL (OBLIGATOIRE)
**Nom de la variable :** `AUTH_URL`

**Valeur exacte à copier :**
```
https://athlink.fr
```
⚠️ **ATTENTION** : Pas de slash (/) à la fin !

---

### 3. DATABASE_URL (OBLIGATOIRE)
**Nom de la variable :** `DATABASE_URL`

**Option A - Base de production Supabase (RECOMMANDÉ) :**
Utilisez votre URL PostgreSQL de production Supabase

**Option B - Utiliser la même base que le dev :**
Allez dans vos **Replit Secrets** et copiez la valeur de `DATABASE_URL`

⚠️ **ATTENTION** : Si vous utilisez la même base, les comptes seront partagés entre dev et prod

---

### 4. STRIPE_SECRET_KEY (OBLIGATOIRE)
**Nom de la variable :** `STRIPE_SECRET_KEY`

**Valeur :** Allez dans vos **Replit Secrets** et copiez la valeur de `STRIPE_SECRET_KEY`

---

### 5. STRIPE_WEBHOOK_SECRET (OBLIGATOIRE)
**Nom de la variable :** `STRIPE_WEBHOOK_SECRET`

**Valeur :** Allez dans vos **Replit Secrets** et copiez la valeur de `STRIPE_WEBHOOK_SECRET`

---

### 6. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (OBLIGATOIRE)
**Nom de la variable :** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Valeur :** Allez dans vos **Replit Secrets** et copiez la valeur de `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

### 7. NEXT_PUBLIC_SUPABASE_URL (OBLIGATOIRE)
**Nom de la variable :** `NEXT_PUBLIC_SUPABASE_URL`

**Valeur :** Allez dans vos **Replit Secrets** et copiez la valeur de `NEXT_PUBLIC_SUPABASE_URL`

---

### 8. NEXT_PUBLIC_SUPABASE_ANON_KEY (OBLIGATOIRE)
**Nom de la variable :** `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Valeur :** Allez dans vos **Replit Secrets** et copiez la valeur de `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 9. NODE_ENV (OPTIONNEL mais recommandé)
**Nom de la variable :** `NODE_ENV`

**Valeur exacte à copier :**
```
production
```

---

### 10. NEXT_PUBLIC_APP_URL (OPTIONNEL mais recommandé)
**Nom de la variable :** `NEXT_PUBLIC_APP_URL`

**Valeur exacte à copier :**
```
https://athlink.fr
```

---

## ✅ Checklist

Cochez quand c'est fait :

- [ ] AUTH_SECRET copié
- [ ] AUTH_URL = `https://athlink.fr`
- [ ] DATABASE_URL copié (ou URL production Supabase)
- [ ] STRIPE_SECRET_KEY copié
- [ ] STRIPE_WEBHOOK_SECRET copié
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY copié
- [ ] NEXT_PUBLIC_SUPABASE_URL copié
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY copié
- [ ] NODE_ENV = `production`
- [ ] NEXT_PUBLIC_APP_URL = `https://athlink.fr`
- [ ] Cliqué sur **"Redeploy"**
- [ ] Testé la connexion sur athlink.fr

---

## 🎯 Après avoir copié tous les secrets

1. Cliquez sur **"Redeploy"** ou **"Deploy"**
2. Attendez que le déploiement se termine (2-3 minutes)
3. Allez sur **https://athlink.fr/signup** et créez un nouveau compte
4. Testez la connexion

---

## ❓ Si ça ne marche toujours pas

- Vérifiez que vous n'avez pas de slash (/) à la fin de `AUTH_URL`
- Vérifiez que vous avez bien cliqué sur "Redeploy" après avoir ajouté les secrets
- Vérifiez les logs de déploiement pour voir s'il y a des erreurs
