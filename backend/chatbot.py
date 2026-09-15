import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

INDICATEURS_VALIDES = [
    "dette_publique", "deficit_budgetaire", "recettes_fiscales",
    "pib_par_habitant", "croissance_pib", "chomage", "inflation",
    "exportations", "importations", "ide_entrants",
    "acces_electricite", "acces_internet", "acces_eau_potable",
    "compte_bancaire", "credit_prive",
    "alphabetisation", "depenses_education",
    "esperance_vie", "depenses_sante",
    "population", "urbanisation"
]

def extraire_parametres(message):
    """Utilise l'IA pour extraire pays et indicateur depuis la question de l'utilisateur"""
    prompt = f"""Analyse cette question sur les finances publiques et extrait les informations suivantes au format JSON strict, sans aucun texte avant ou après :

{{
  "pays_code": "code ISO3 du pays mentionné (ex: FRA, USA, TUN), ou null si aucun pays précis n'est mentionné",
  "indicateur": "un seul indicateur parmi cette liste EXACTE: {INDICATEURS_VALIDES}, ou null si aucun n'est identifiable",
  "annee": "année mentionnée (nombre), ou null si aucune"
}}

Question : "{message}"

Réponds uniquement avec le JSON, rien d'autre."""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150,
        temperature=0,
    )

    try:
        texte = response.choices[0].message.content.strip()
        # Enlève d'éventuels ```json ... ``` autour du JSON
        texte = texte.replace("```json", "").replace("```", "").strip()
        return json.loads(texte)
    except Exception:
        return {"pays_code": None, "indicateur": None, "annee": None}


def generer_reponse_chat(message, donnees):
    """Génère une réponse en langage naturel à partir des données récupérées"""
    if not donnees:
        prompt = f"""L'utilisateur a posé cette question : "{message}"

Aucune donnée n'a été trouvée dans la base pour répondre précisément. 
Réponds en français, poliment, en expliquant que tu n'as pas trouvé de donnée correspondante, 
et suggère de reformuler avec un pays et un indicateur précis (dette publique, inflation, chômage, PIB par habitant, croissance du PIB, déficit budgétaire, recettes fiscales)."""
    else:
        resume = "\n".join(
            [f"{d['pays_nom']} ({d['annee']}): {d['valeur']:.2f}" for d in donnees]
        )
        prompt = f"""L'utilisateur a posé cette question : "{message}"

Voici les données réelles disponibles pour y répondre :
{resume}

Réponds en français, de façon claire et concise (3-4 phrases maximum), en te basant uniquement sur ces données."""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300,
        temperature=0.4,
    )
    return response.choices[0].message.content