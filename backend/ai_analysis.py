import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

NOMS_INDICATEURS = {
    "dette_publique": "la dette publique (% du PIB)",
    "deficit_budgetaire": "le déficit budgétaire (% du PIB)",
    "recettes_fiscales": "les recettes fiscales (% du PIB)",
    "pib_par_habitant": "le PIB par habitant (US$)",
    "croissance_pib": "la croissance du PIB (%)",
    "chomage": "le taux de chômage (%)",
    "inflation": "l'inflation (%)",
}


def generer_analyse(data, pays1_nom, pays2_nom, indicateur):
    """
    data: liste de dictionnaires avec pays_code, pays_nom, annee, indicateur, valeur
    """
    nom_indicateur = NOMS_INDICATEURS.get(indicateur, indicateur)

    # Résume les données en texte simple pour ne pas surcharger le prompt
    resume_donnees = "\n".join(
        [f"{row['pays_nom']} ({row['annee']}): {row['valeur']:.2f}" for row in data]
    )

    prompt = f"""Voici des données comparant {nom_indicateur} entre {pays1_nom} et {pays2_nom} :

{resume_donnees}

Rédige une analyse comparative courte (4-5 phrases maximum) en français, claire et accessible à un public non spécialiste. 
Mentionne les tendances générales, les écarts notables, et une explication plausible si pertinent.
Ne mentionne pas les chiffres bruts en détail, concentre-toi sur l'interprétation."""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400,
        temperature=0.5,
    )

    return response.choices[0].message.content