# FDES Manager – Wienerberger

Application web de suivi des Fiches de Déclaration Environnementale et Sanitaire (FDES) pour Wienerberger France.

## Présentation

FDES Manager permet de centraliser et suivre l'avancement des FDES produits de Wienerberger, depuis le lancement jusqu'à la vérification finale. Toutes les données sont stockées localement dans le navigateur (localStorage), sans serveur requis.

## Fonctionnalités

- **Dashboard** avec compteurs par statut et barre de progression globale
- **Ajout de FDES** via une modale (nom du produit, statut initial, deadline cible)
- **Changement de statut** directement depuis le tableau ou la vue détail
- **Indicateur de deadline** (OK / Bientôt / Dépassée)
- **Vue détail** par produit
- **Suppression** avec confirmation
- **Raccourcis clavier** : `Échap` pour fermer, `Entrée` pour valider

## Statuts disponibles

| # | Statut |
|---|--------|
| 0 | Lancement |
| 1 | En cours de collecte |
| 2 | En cours de modélisation |
| 3 | En cours de rapport |
| 4 | En cours de vérification |
| 5 | Vérifié |

## Structure du projet

```
fdes-app/
├── index.html       # Structure HTML
├── css/
│   └── style.css    # Styles de l'application
├── js/
│   └── app.js       # Logique JavaScript
└── README.md
```

## Utilisation

Ouvrir `index.html` directement dans un navigateur — aucune installation requise.

## Technologies

- HTML5 / CSS3 / JavaScript vanilla
- Google Fonts (Inter)
- localStorage pour la persistance des données

---

Développé pour **Wienerberger France** — Chef de projet environnement.
