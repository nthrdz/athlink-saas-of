# Guide de Déploiement Athlink sur Replit

## Problème : La connexion fonctionne en preview mais pas en production (athlink.fr)

### Cause

Les **secrets Replit** (variables d'environnement) ne sont PAS automatiquement copiés vers votre déploiement production. Vous devez les configurer séparément.

---

## Solution : Configurer les Secrets de Déploiement

### Étape 1 : Accéder aux Secrets de Déploiement

1. Dans Replit, cliquez sur le bouton **"Deploy"** (Déployer)
2. Allez dans l'onglet **"Settings"** ou **"Configuration"**
3. Cherchez la section **"Deployment Secrets"** ou **"Environment Variables"**

### Étape 2 : Ajouter les Variables d'Environnement Essentielles

Ajoutez ces secrets **un par un** dans la section Deployment Secrets :

#### 🔐 Authentification NextAuth (OBLIGATOIRE)
```
AUTH_SECRET=votre-secret-nextauth-actuel
```
> ⚠️ **IMPORTANT** : Utilisez le MÊME secret que vous avez dans vos Workspace Secrets (celui nommé `NEXTAUTH_SECRET`)

```
AUTH_URL=https://athlink.fr
```
> 📝 **NOTE** : Pour la production, utilisez `https://athlink.fr` (SANS slash à la fin). Pour le preview Replit, cette variable n'est pas nécessaire car elle est auto-détectée.

#### 🗄️ Base de Données (OBLIGATOIRE)
```
DATABASE_URL=votre-url-postgresql-production
```
> ⚠️ **ATTENTION** : NE PAS utiliser la base de données de développement ! Utilisez une base de données de production séparée (celle de Supabase par exemple)

#### 💳 Stripe (OBLIGATOIRE pour les paiements)
```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 📁 Supabase (OBLIGATOIRE pour le stockage)
```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 🌐 Configuration Application
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://athlink.fr
```

#### 🔐 Google OAuth (OPTIONNEL)
Si vous voulez activer la connexion Google :
```
GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-secret-google
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true
```

---

## Étape 3 : Redéployer l'Application

1. Après avoir ajouté tous les secrets, cliquez sur **"Redeploy"**
2. Attendez que le build se termine
3. Testez la connexion sur athlink.fr

---

## Vérification : Comment tester

1. Allez sur **https://athlink.fr/login**
2. Essayez de vous connecter avec vos identifiants
3. Ou essayez de créer un nouveau compte sur **https://athlink.fr/signup**

Si ça ne marche toujours pas :
- Vérifiez les logs de déploiement dans Replit
- Assurez-vous que tous les secrets sont bien copiés
- Vérifiez que `AUTH_URL=https://athlink.fr` (sans slash à la fin)

---

## Notes Importantes

### ⚠️ Bases de Données Séparées

- **Preview Replit** = Base de données de développement (Replit PostgreSQL)
- **athlink.fr** = Base de données de production (séparée)

Les comptes créés en développement N'EXISTENT PAS en production. C'est normal et voulu pour la sécurité.

### 🔑 Générer un AUTH_SECRET

Si vous avez besoin de générer un nouveau secret :

```bash
openssl rand -base64 32
```

Ou utilisez ce générateur en ligne : https://generate-secret.vercel.app/32

### ⚙️ Configuration Automatique

**Bonne nouvelle !** Certaines configurations sont déjà gérées automatiquement dans le code :
- ✅ `trustHost: true` est déjà configuré dans `lib/auth.ts` (pas besoin de variable d'environnement)
- ✅ Mode debug activé automatiquement en développement

### 📋 Checklist de Déploiement

- [ ] `AUTH_SECRET` configuré (OBLIGATOIRE)
- [ ] `AUTH_URL=https://athlink.fr` configuré (OBLIGATOIRE pour production)
- [ ] `DATABASE_URL` pointe vers la base de production (OBLIGATOIRE)
- [ ] `STRIPE_SECRET_KEY` configuré
- [ ] `STRIPE_WEBHOOK_SECRET` configuré
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` configuré
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configuré
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configuré
- [ ] Application redéployée
- [ ] Test de connexion effectué

---

## Différences NextAuth v4 vs v5

NextAuth v5 a changé les noms des variables :
- ~~`NEXTAUTH_SECRET`~~ → `AUTH_SECRET`
- ~~`NEXTAUTH_URL`~~ → `AUTH_URL`

Les deux fonctionnent encore (rétrocompatibilité), mais `AUTH_*` est recommandé.

---

## Besoin d'aide ?

Si vous rencontrez des problèmes :
1. Vérifiez les logs de déploiement dans Replit
2. Assurez-vous que tous les secrets sont configurés
3. Vérifiez que la base de données de production est accessible
4. Testez d'abord l'inscription avant la connexion
