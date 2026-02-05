# 🎨 VDS Templates - Éditeur de Publications Quotidiennes

Application web professionnelle pour créer et personnaliser des templates de publications "Pensée du Jour" et "Pensée de Saint" pour les réseaux sociaux.

![VDS Templates](https://img.shields.io/badge/version-1.0.0-blue) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## 📋 Table des Matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Structure du Projet](#structure-du-projet)
- [Technologies Utilisées](#technologies-utilisées)
- [Guide d'Utilisation](#guide-dutilisation)
- [Personnalisation Avancée](#personnalisation-avancée)
- [Templates Disponibles](#templates-disponibles)
- [Export et Formats](#export-et-formats)

---

## ✨ Aperçu

**VDS Templates** est une application web moderne qui permet de créer facilement des visuels inspirants pour vos publications quotidiennes. L'interface intuitive offre un contrôle total sur le design, avec preview en temps réel.

### 🎯 Cas d'Usage

- Publications quotidiennes sur Instagram, Facebook, LinkedIn
- Stories et posts inspirants
- Contenu religieux et spirituel
- Citations motivationnelles
- Communication d'église ou communauté

---

## 🚀 Fonctionnalités

### ✅ Fonctionnalités Principales Implémentées

#### 1. **Sélection du Type de Publication**
- 📿 **Pensée du Jour** : Designs inspirants pour citations quotidiennes
- ⛪ **Pensée de Saint** : Designs spirituels pour sagesse religieuse

#### 2. **6 Templates Professionnels**
- 3 designs pour "Pensée du Jour"
  - Minimaliste Élégant (cadre circulaire doré)
  - Géométrique Moderne (formes abstraites)
  - Artistique Lumineux (effet bokeh)
- 3 designs pour "Pensée de Saint"
  - Spirituel Sophistiqué (cadre orné)
  - Contemporain Sacré (géométrie sacrée)
  - Raffiné Céleste (dégradé céleste)

#### 3. **Éditeur de Contenu Complet**
- ✍️ Modification du titre
- 📝 Citation avec compteur de caractères (max 300)
- 👤 Attribution d'auteur/saint
- 🔄 Mise à jour en temps réel

#### 4. **Gestion d'Images**
- 📤 Upload d'images personnalisées
- 🖼️ Galerie de 16 images prédéfinies
  - 8 images nature pour "Pensée du Jour"
  - 8 images spirituelles pour "Pensée de Saint"
- 🎭 Aperçu instantané

#### 5. **Personnalisation Visuelle**
- 🎨 **Couleur du cadre** : Sélecteur de couleur + code hex
- 🔤 **Couleur du texte** : Personnalisation complète
- 🌈 **Couleur de l'overlay** : Contrôle de l'arrière-plan
- 💧 **Opacité de l'overlay** : Slider 0-100%

#### 6. **Export Professionnel**
- 💾 Téléchargement PNG haute qualité
- 📐 Format 1024×1024 pixels (optimal pour réseaux sociaux)
- 🎯 Nom de fichier automatique avec date

#### 7. **Interface Moderne**
- 🎭 Design élégant or/bleu/gris
- ✨ Animations fluides
- 📱 Responsive (mobile, tablette, desktop)
- 🌙 Thème sombre professionnel

---

## 📁 Structure du Projet

```
vds-templates/
│
├── index.html              # Page principale
│
├── css/
│   └── style.css          # Styles globaux (14KB)
│
├── js/
│   ├── app.js            # Logique principale et événements
│   ├── templates.js      # Définitions des 6 templates
│   ├── gallery.js        # Gestion galerie et upload
│   └── canvas.js         # Rendu canvas et export
│
└── README.md             # Documentation (ce fichier)
```

---

## 🛠️ Technologies Utilisées

### Frontend
- **HTML5** : Structure sémantique
- **CSS3** : Design moderne avec gradients, animations
- **JavaScript (Vanilla)** : Logique interactive
- **Canvas API** : Rendu graphique haute qualité

### Bibliothèques CDN
- **Google Fonts** : Playfair Display (serif élégant) + Inter (sans-serif moderne)
- **Font Awesome 6** : Icônes vectorielles

### APIs Utilisées
- Canvas 2D Context API
- File API (upload d'images)
- Blob API (export PNG)

---

## 📖 Guide d'Utilisation

### 1️⃣ Choisir le Type de Publication

Dans le panneau latéral, cliquez sur :
- **Pensée du Jour** pour citations inspirantes
- **Pensée de Saint** pour contenu spirituel

### 2️⃣ Sélectionner un Design

Choisissez parmi 3 styles différents :
- Minimaliste / Spirituel Sophistiqué
- Géométrique / Contemporain Sacré
- Artistique / Raffiné Céleste

### 3️⃣ Personnaliser le Contenu

**Titre** : Modifiez le titre principal (max 50 caractères)

**Citation** : Entrez votre texte inspirant (max 300 caractères)
- Le compteur affiche les caractères restants
- Le texte s'ajuste automatiquement sur plusieurs lignes

**Auteur** : Ajoutez le nom de l'auteur ou du saint (max 50 caractères)

### 4️⃣ Choisir une Image de Fond

**Option A - Galerie**
- Parcourez les 8 images prédéfinies
- Cliquez sur une image pour l'appliquer

**Option B - Upload**
- Cliquez sur "Télécharger une Image"
- Sélectionnez une image de votre ordinateur
- Formats acceptés : JPG, PNG, WEBP

### 5️⃣ Ajuster les Couleurs

**Couleur du Cadre** : Modifiez la couleur des bordures dorées
- Sélecteur visuel ou code hex manuel
- Défaut : #d4af37 (or)

**Couleur du Texte** : Changez la couleur des textes
- Défaut : #ffffff (blanc)

**Overlay** : Contrôlez la superposition
- Couleur : Défaut #000000 (noir)
- Opacité : 0-100% (défaut 50%)

### 6️⃣ Exporter le Design

1. Vérifiez le preview en temps réel
2. Cliquez sur **"Télécharger (1024x1024 PNG)"**
3. Le fichier est sauvegardé avec le nom : `jour-2026-01-29.png` ou `saint-2026-01-29.png`

---

## 🎨 Personnalisation Avancée

### Modifier les Templates

Éditez `js/templates.js` pour :
- Ajouter de nouveaux styles
- Modifier les polices par défaut
- Ajuster les tailles de texte
- Créer de nouveaux effets de cadre

```javascript
{
    id: 'custom-1',
    name: 'Mon Style Personnalisé',
    icon: 'fa-heart',
    style: 'custom',
    defaultBg: 'URL_IMAGE',
    frameStyle: 'circular', // circular, geometric, ornate, elegant
    frameColor: '#d4af37',
    titleFont: 'Playfair Display',
    titleSize: 48,
    // ... autres propriétés
}
```

### Ajouter des Images à la Galerie

Éditez `js/gallery.js` :

```javascript
galleryImages.jour.push({
    url: 'https://votre-image.jpg',
    name: 'Nom de l\'image',
    category: 'nature'
});
```

### Personnaliser les Couleurs

Modifiez les variables CSS dans `css/style.css` :

```css
:root {
    --gold: #d4af37;        /* Couleur or */
    --dark-blue: #1a2332;   /* Bleu foncé */
    --light-blue: #3498db;  /* Bleu clair */
    /* ... */
}
```

---

## 🎭 Templates Disponibles

### 📿 Pensée du Jour

| Template | Style | Caractéristiques |
|----------|-------|------------------|
| **Minimaliste Élégant** | Épuré | Cadre circulaire doré, dégradé sophistiqué |
| **Géométrique Moderne** | Contemporain | Formes abstraites, accents dorés sur fond sombre |
| **Artistique Lumineux** | Créatif | Effet bokeh, palette bleu/or chaleureuse |

### ⛪ Pensée de Saint

| Template | Style | Caractéristiques |
|----------|-------|------------------|
| **Spirituel Sophistiqué** | Traditionnel | Cadre orné, fond bleu royal, éléments sacrés |
| **Contemporain Sacré** | Moderne | Géométrie sacrée, motifs symboliques |
| **Raffiné Céleste** | Mystique | Dégradé bleu-violet, ambiance éthérée |

---

## 📤 Export et Formats

### Format de Sortie
- **Type** : PNG (Portable Network Graphics)
- **Dimensions** : 1024×1024 pixels (1:1)
- **Qualité** : Maximale (compression 1.0)
- **Taille de fichier** : ~500KB - 2MB selon l'image

### Compatibilité Réseaux Sociaux

| Plateforme | Post Carré | Stories | Commentaire |
|------------|------------|---------|-------------|
| **Instagram** | ✅ Parfait | ✅ (recadrage auto) | Format optimal |
| **Facebook** | ✅ Parfait | ✅ | Compatible posts et stories |
| **LinkedIn** | ✅ Parfait | ❌ | Idéal pour publications |
| **Twitter/X** | ✅ Parfait | ❌ | Excellent pour tweets |
| **Pinterest** | ⚠️ Bon | ❌ | Format carré accepté |

---

## 🎯 Fonctionnalités à Venir (Roadmap)

### Version 1.1 (Planifiée)
- [ ] Historique des créations récentes
- [ ] Sauvegarde des designs en cours
- [ ] Préréglages de couleurs personnalisés
- [ ] Plus de polices de caractères

### Version 1.2 (Future)
- [ ] Formats d'export multiples (16:9, 9:16, 4:5)
- [ ] Filtres et effets d'image intégrés
- [ ] Mode d'édition par lots
- [ ] Intégration API réseaux sociaux

### Version 2.0 (Vision)
- [ ] Éditeur de templates par drag & drop
- [ ] Bibliothèque d'éléments graphiques
- [ ] Collaboration en temps réel
- [ ] Application mobile native

---

## 🔧 Configuration Technique

### Prérequis
- Navigateur moderne (Chrome 90+, Firefox 88+, Safari 14+)
- JavaScript activé
- Connexion internet (pour CDN et images Unsplash)

### Performance
- **Temps de chargement** : < 2 secondes
- **Rendu canvas** : Temps réel (< 100ms)
- **Export PNG** : < 1 seconde

### Limitations Connues
- Les images uploadées ne sont pas sauvegardées (session uniquement)
- CORS peut empêcher certaines images externes
- Export limité à 1024×1024 (modifiable dans le code)

---

## 📞 Support et Contact

### Signaler un Bug
Si vous rencontrez un problème, vérifiez :
1. La console JavaScript (F12) pour les erreurs
2. Que votre navigateur est à jour
3. Que JavaScript est activé

### Suggestions d'Amélioration
Nous sommes ouverts aux suggestions pour améliorer l'application !

---

## 📜 Licence

Ce projet est développé pour un usage personnel et communautaire.

---

## 🙏 Remerciements

- **Unsplash** : Images de haute qualité gratuites
- **Google Fonts** : Polices Playfair Display et Inter
- **Font Awesome** : Bibliothèque d'icônes
- **VDS Community** : Inspiration et feedback

---

## 🎓 Crédits

**Développé avec ❤️ pour la communauté VDS**

Version 1.0.0 - Janvier 2026

---

**🚀 Commencez à créer vos publications inspirantes dès maintenant !**

Ouvrez `index.html` dans votre navigateur et laissez libre cours à votre créativité.