# NLoger - Plateforme de Gestion Immobilière

NLoger est une application web moderne de gestion immobilière permettant aux utilisateurs de rechercher, consulter et mettre en ligne des annonces de logements. Le projet est divisé en un backend puissant sous Django et un frontend réactif en React.

## 🚀 Fonctionnalités

- **Recherche de Biens** : Filtrez les propriétés par type, prix et emplacement.
- **Cartographie Interactive** : Visualisation des biens sur une carte.
- **Gestion des Annonces** : Publication et modification de logements.
- **Interface Agent** : Permet aux démarcheurs de gérer leurs contacts et propriétés.
- **PWA (Progressive Web App)** : Disponible hors ligne et installable sur mobile.

## 🛠️ Technologies Utilisées

- **Backend** : Django 5.1, Django REST Framework 3.16, JWT Auth, SQLite (Développement).
- **Frontend** : React 19, Vite 7, Tailwind CSS 4, React Router 7.
- **Cartographie** : Leaflet / React-Leaflet.
- **Style** : Design moderne, fluide et responsive avec Tailwind CSS.
- **Tests** : Vitest & React Testing Library (Frontend), Django Test (Backend).
- **Outils** : Lucide React, Recharts, React Hot Toast, Vite PWA.

## 📦 Installation et Configuration

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm ou yarn

### 1. Configuration du Backend (logema)

```bash
cd logema
# Créer un environnement virtuel
python -m venv venv
# Activer l'environnement (Windows)
.\venv\Scripts\activate
# Installer les dépendances
pip install -r requirements.txt
# Appliquer les migrations
python manage.py migrate
# Lancer le serveur
python manage.py runserver
```

### 2. Configuration du Frontend (frontend)

```bash
cd frontend
# Installer les dépendances
npm install
# Lancer le serveur de développement
npm run dev
```

## 📄 Documentation API

L'API est documentée via Django REST Framework. Une fois le serveur lancé, vous pouvez accéder à l'interface d'administration sur `/admin` et aux points de terminaison de l'API.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une Issue ou à soumettre une Pull Request.

---
Développé avec ❤️ pour simplifier l'immobilier.
