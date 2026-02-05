# VDS Montage

Application Next.js pour créer des visuels inspirants pour les réseaux sociaux avec génération IA.

## Fonctionnalités

- **6 Templates** : 3 pour "Pensée du Jour" et 3 pour "Pensée de Saint"
- **Génération IA** : 
  - Citations et auteurs générés par GPT-4
  - Images de fond générées par DALL-E 3
  - Bouton "Tout Générer" pour une création rapide
- **Logo Personnalisé** : Uploadez votre propre logo pour remplacer le logo VDS
- **Personnalisation Complète** :
  - Couleurs du cadre, texte et overlay
  - Opacité de l'overlay ajustable
  - Galerie d'images prédéfinies
  - Import d'images personnalisées
- **Export PNG** : Téléchargez votre création en haute qualité (1024x1024)

## Stack Technique

- **Framework** : Next.js 14 (App Router)
- **UI** : Tailwind CSS
- **State** : Zustand
- **IA** : OpenAI (GPT-4 + DALL-E 3)
- **Stockage** : Vercel Blob (logos personnalisés)

## Installation

```bash
# Cloner le projet
git clone https://github.com/votre-username/VDS-Montage.git
cd VDS-Montage

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés API

# Lancer en développement
npm run dev
```

## Variables d'Environnement

```env
# Clé API OpenAI pour la génération de texte et d'images
OPENAI_API_KEY=sk-...

# Token Vercel Blob pour le stockage des logos (optionnel)
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

## Structure du Projet

```
app/
├── page.tsx                    # Page principale (éditeur)
├── layout.tsx                  # Layout avec fonts
├── globals.css                 # Styles Tailwind
├── api/
│   ├── generate/
│   │   ├── text/route.ts       # API génération citation + auteur
│   │   └── image/route.ts      # API génération image DALL-E
│   └── logo/route.ts           # API upload logo

components/
├── editor/
│   ├── Canvas.tsx              # Canvas de prévisualisation
│   ├── TemplateSelector.tsx    # Sélection de template
│   └── Controls.tsx            # Contrôles de personnalisation
├── ai/
│   └── AIGeneratePanel.tsx     # Panneau génération IA
├── gallery/
│   ├── ImageGallery.tsx        # Galerie d'images
│   └── LogoUploader.tsx        # Upload logo personnalisé
└── ui/
    ├── Toast.tsx               # Notifications
    └── LoadingOverlay.tsx      # Overlay de chargement

lib/
├── store.ts                    # Store Zustand
├── templates.ts                # Définitions templates
├── openai.ts                   # Client OpenAI
├── canvas-utils.ts             # Utilitaires canvas
└── utils.ts                    # Utilitaires généraux
```

## Utilisation

1. **Sélectionner un type** : Pensée du Jour ou Pensée de Saint
2. **Choisir un template** : 3 styles disponibles par type
3. **Générer le contenu** :
   - Cliquer sur "Tout Générer" pour une génération complète par IA
   - Ou générer texte et image séparément
   - Ou saisir manuellement le contenu
4. **Personnaliser** : Ajuster les couleurs et l'opacité
5. **Ajouter un logo** (optionnel) : Uploader votre logo personnalisé
6. **Exporter** : Télécharger en PNG

## Déploiement

### Vercel (Recommandé)

1. Connecter votre repo GitHub à Vercel
2. Ajouter les variables d'environnement dans les paramètres du projet
3. Déployer

### Autre hébergement

```bash
npm run build
npm run start
```

## Licence

MIT
