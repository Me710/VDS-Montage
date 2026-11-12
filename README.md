# VDS Montage

Application Next.js pour créer des visuels inspirants (citations, versets, vies de saints) pour les réseaux sociaux, avec génération IA gratuite.

## Fonctionnalités

- **5 types de publication** : Pensée du Jour, Pensée de Saint, Un Regard au Ciel, L'Évangile Illustré, Histoire (vie des saints), avec plusieurs templates chacun
- **Génération IA sans clé API** : texte et image via [Pollinations.ai](https://pollinations.ai) (modèles open source)
- **Évangile du jour** récupéré depuis AELF.org
- **Personnalisation** : polices, taille, couleurs, opacité, image de fond (galerie ou import), logo personnalisé (conservé dans le navigateur)
- **3 formats** : 1:1, 16:9, 9:16
- **Export et partage** : PNG, sauvegarde Telegram, WhatsApp, Facebook, Instagram

## Stack technique

- **Framework** : Next.js 14 (App Router), React 18, TypeScript
- **UI** : Tailwind CSS, lucide-react
- **État** : Zustand
- **IA** : Pollinations.ai (texte : GPT-OSS 20B ; image : service image)
- **Base de données** : PostgreSQL (`pg`), connexion prête, pas encore utilisée par une fonctionnalité
- **Hébergement** : Railway (déploiement automatique à chaque push sur `main`)

## Installation

```bash
git clone https://github.com/Me710/VDS-Montage.git
cd VDS-Montage
npm install
cp .env.example .env   # toutes les variables sont optionnelles
npm run dev
```

## Variables d'environnement

Toutes sont optionnelles. Voir `.env.example`.

| Variable | Rôle |
|---|---|
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Bouton « Sauvegarder Telegram » |
| `DATABASE_URL` | Connexion PostgreSQL (vérifiable via `/api/health/db`) |
| `POLLINATIONS_TEXT_MODEL` | Remplace le modèle de texte par défaut (`openai-fast`) |

## Architecture

```
app/
├── page.tsx                  # Éditeur : une seule mise en page montée (bureau ou mobile)
├── layout.tsx                # Polices, métadonnées, notifications globales
├── error.tsx, global-error.tsx, not-found.tsx
└── api/
    ├── generate/text         # Génération de texte
    ├── generate/image        # Génération d'image
    ├── evangile              # Évangile du jour (AELF.org)
    ├── telegram              # Envoi de l'image sur Telegram
    └── health/db             # Vérification de la base de données

components/
├── editor/                   # Canvas, sélecteur de type/template, contrôles
├── ai/                       # Panneau de génération IA
├── gallery/                  # Images de fond, logo
├── share/                    # Export et partage
└── ui/                       # Modal, Toaster

lib/
├── api-server.ts             # Erreurs JSON uniformes, validation, délais, limite de débit
├── api-client.ts             # fetch côté navigateur : délai, erreurs en français
├── text-generation.ts        # Prompts et analyse des réponses texte
├── pollinations-text.ts      # Client texte Pollinations (retries)
├── pollinations.ts           # Prompts et client image Pollinations (retries)
├── telegram.ts               # Client Telegram
├── db.ts                     # Pool PostgreSQL
├── store.ts, toast-store.ts  # État de l'éditeur, notifications
├── canvas/                   # Rendu du visuel : index (entrée), frames, text, logo,
│                             #   regard-ciel, evangile, histoire, helpers, types
├── templates.ts              # Templates et galerie
└── files.ts, utils.ts, use-is-desktop.ts
```

### Conventions d'erreur

Toutes les routes API répondent en cas d'échec par `{ "error": "<message en français>", "code": "<code>" }`. Le message est affichable tel quel ; les détails techniques restent dans les logs serveur.

## Limites connues

- Le palier gratuit de Pollinations limite le débit (environ une requête texte toutes les 30 s et une image toutes les 45 s, par adresse IP du serveur). L'application patiente et réessaie automatiquement.
- Le modèle de texte est petit : vérifiez les citations et références avant publication.

## Licence

MIT
