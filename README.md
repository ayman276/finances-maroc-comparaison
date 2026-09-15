# 🇲🇦 Comparaison des Finances Publiques du Maroc

Plateforme web intelligente permettant de comparer les finances publiques du Maroc avec celles de n'importe quel pays du monde, à partir de données internationales fiables (Banque mondiale), enrichie d'intelligence artificielle et d'un tableau de bord décisionnel.

Projet réalisé dans le cadre d'un stage au **Ministère de l'Économie et des Finances** (Royaume du Maroc).

---

##  Sommaire

- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Stack technique](#-stack-technique)
- [Indicateurs couverts](#-indicateurs-couverts)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [Captures d'écran](#-captures-décran)
- [Limites et perspectives](#-limites-et-perspectives)
- [Auteur](#-auteur)

---

##  Fonctionnalités

- **Comparaison dynamique** : sélection libre d'un pays à comparer avec le Maroc, sur 21 indicateurs différents (finances publiques, économie, commerce, infrastructures, éducation, santé, démographie...)
- **Analyse automatique par IA** : génération d'un commentaire en langage naturel à partir des données comparées (via Groq)
- **Chatbot conversationnel** : interrogation du système en langage naturel (ex : *"Quelle est l'inflation au Maroc en 2022 ?"*)
- **Tableau de bord Power BI** : graphique comparatif interactif, carte du monde à bulles, segments dynamiques (indicateur, pays, année)
- **Gestion transparente des données manquantes** : signalement explicite lorsqu'une donnée n'est pas disponible pour un pays/une année

---

##  Architecture

```
Collecte de données (World Bank API)
          ↓
Base de données PostgreSQL (Supabase)
          ↓
        API FastAPI
     ↙      ↓       ↘
Frontend   Chatbot   Dashboard
React        IA       Power BI
     ↘      ↓       ↙
      Utilisateur final
```

##  Stack technique

| Composant | Technologie |
|---|---|
| Backend / API | Python, FastAPI, SQLAlchemy |
| Base de données | PostgreSQL (hébergée sur Supabase) |
| Frontend | React, Recharts, Axios |
| Intelligence artificielle | Groq API (GPT-OSS-120B) |
| Business Intelligence | Microsoft Power BI |
| Source de données | [World Bank Open Data API](https://data.worldbank.org) |

##  Indicateurs couverts

21 indicateurs répartis en 8 catégories, pour 217 pays :

- **Finances publiques** : dette publique, déficit budgétaire, recettes fiscales, recettes/dépenses publiques
- **Économie générale** : PIB par habitant, croissance du PIB, chômage, inflation
- **Commerce extérieur** : exportations, importations, investissements directs étrangers
- **Infrastructures** : accès à l'électricité, à internet, à l'eau potable
- **Inclusion financière** : détention de compte bancaire, crédit au secteur privé
- **Éducation** : alphabétisation, dépenses en éducation
- **Santé** : espérance de vie, dépenses de santé
- **Démographie** : population, taux d'urbanisation

---

##  Installation

### Prérequis

- Python 3.10+
- Node.js (version LTS)
- Un compte [Supabase](https://supabase.com) avec une base PostgreSQL provisionnée
- Une clé d'API [Groq](https://console.groq.com)

### 1. Cloner le dépôt

```bash
git clone https://github.com/ayman276/finances-maroc-comparaison.git
cd finances-maroc-comparaison
```

### 2. Configurer le backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

Crée un fichier `.env` dans `backend/` avec :

```
DATABASE_URL=postgresql://postgres.xxxxx:MOT_DE_PASSE@aws-0-region.pooler.supabase.com:6543/postgres
GROQ_API_KEY=ta_clé_groq
```

### 3. Collecter et charger les données

```bash
python data_collection.py
python database.py
```

### 4. Lancer le backend

```bash
uvicorn main:app --reload
```

L'API est accessible sur `http://127.0.0.1:8000` — documentation interactive sur `http://127.0.0.1:8000/docs`.

### 5. Configurer et lancer le frontend

Dans un **second terminal** :

```bash
cd frontend
npm install
npm start
```

Le site est accessible sur `http://localhost:3000`.

 Le backend et le frontend doivent tourner **simultanément**, chacun dans son propre terminal.

---

##  Utilisation

1. Sélectionne un pays et un indicateur, clique sur **"Comparer"**
2. Consulte le graphique et l'analyse générée automatiquement par IA
3. Utilise le **chatbot** (bouton flottant en bas à droite) pour poser une question en langage naturel
4. Ouvre le fichier `.pbix` dans Power BI Desktop pour explorer le tableau de bord

---

##  Structure du projet

```
projet-finances/
├── backend/
│   ├── main.py                 # API FastAPI (7 endpoints)
│   ├── data_collection.py      # Script de collecte des données (World Bank API)
│   ├── database.py             # Chargement des données dans Supabase
│   ├── ai_analysis.py          # Génération d'analyses automatiques (Groq)
│   ├── chatbot.py              # Logique du chatbot conversationnel
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.js              # Composant principal (comparaison, graphique)
│       └── Chatbot.js          # Widget de chat flottant
└── README.md
```

---

##  Captures d'écran

<!-- Ajoute ici tes propres captures d'écran, par exemple : -->
<!-- ![Interface principale](docs/screenshot-site.png) -->
<!-- ![Chatbot](docs/screenshot-chatbot.png) -->
<!-- ![Dashboard Power BI](docs/screenshot-powerbi.png) -->

---

##  Limites et perspectives

- Couverture de données hétérogène selon les indicateurs et les pays (ex : dette publique du Maroc limitée à 2011 dans la base World Bank)
- Absence de mise à jour automatique des données (collecte manuelle via script)
- Connexion Power BI reposant sur un export CSV statique (limitation de connexion SSL avec Supabase)

**Perspectives d'amélioration** : croisement avec d'autres sources (FMI, Ministère), déploiement en ligne, automatisation de la mise à jour des données, extension du chatbot à des questions multi-critères.

---

##  Auteur

**Ayman Silouli**
Stage — Ministère de l'Économie et des Finances, Royaume du Maroc