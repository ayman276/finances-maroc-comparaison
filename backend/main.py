import os
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from chatbot import extraire_parametres, generer_reponse_chat

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

app = FastAPI(title="API Finances Maroc")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "API Finances Maroc en ligne"}


@app.get("/pays")
def get_countries():
    query = text("SELECT DISTINCT pays_code, pays_nom FROM indicateurs ORDER BY pays_nom")
    with engine.connect() as conn:
        result = conn.execute(query)
        return [dict(row._mapping) for row in result]


@app.get("/indicateurs")
def get_indicateurs():
    query = text("""
        SELECT DISTINCT indicateur FROM indicateurs 
        WHERE indicateur NOT IN ('recettes_publiques', 'depenses_publiques')
        ORDER BY indicateur
    """)
    with engine.connect() as conn:
        result = conn.execute(query)
        return [row[0] for row in result]


@app.get("/comparaison")
def compare(pays1: str, pays2: str, indicateur: str):
    query = text("""
        SELECT pays_code, pays_nom, annee, indicateur, valeur 
        FROM indicateurs 
        WHERE pays_code IN (:p1, :p2) AND indicateur = :ind
        ORDER BY annee
    """)
    with engine.connect() as conn:
        result = conn.execute(query, {"p1": pays1, "p2": pays2, "ind": indicateur})
        return [dict(row._mapping) for row in result]


@app.get("/pays/{pays_code}")
def get_pays_data(pays_code: str):
    query = text("""
        SELECT pays_code, pays_nom, annee, indicateur, valeur 
        FROM indicateurs 
        WHERE pays_code = :code
        ORDER BY indicateur, annee
    """)
    with engine.connect() as conn:
        result = conn.execute(query, {"code": pays_code})
        return [dict(row._mapping) for row in result]


@app.get("/analyse")
def get_analyse(pays1: str, pays2: str, indicateur: str):
    from ai_analysis import generer_analyse

    query = text("""
        SELECT pays_code, pays_nom, annee, indicateur, valeur 
        FROM indicateurs 
        WHERE pays_code IN (:p1, :p2) AND indicateur = :ind
        ORDER BY annee
    """)
    with engine.connect() as conn:
        result = conn.execute(query, {"p1": pays1, "p2": pays2, "ind": indicateur})
        data = [dict(row._mapping) for row in result]

    if not data:
        return {"analyse": "Aucune donnée disponible pour générer une analyse."}

    pays1_nom = next((d["pays_nom"] for d in data if d["pays_code"] == pays1), pays1)
    pays2_nom = next((d["pays_nom"] for d in data if d["pays_code"] == pays2), pays2)

    analyse = generer_analyse(data, pays1_nom, pays2_nom, indicateur)
    return {"analyse": analyse}


@app.post("/chatbot")
def chatbot(message: str = Body(..., embed=True)):
    params = extraire_parametres(message)

    pays_code = params.get("pays_code") or "MAR"
    indicateur = params.get("indicateur")
    annee = params.get("annee")

    if not indicateur:
        return {"reponse": generer_reponse_chat(message, [])}

    if annee:
        query = text("""
            SELECT pays_code, pays_nom, annee, indicateur, valeur 
            FROM indicateurs 
            WHERE pays_code = :p AND indicateur = :ind AND annee = :an
        """)
        params_sql = {"p": pays_code, "ind": indicateur, "an": annee}
    else:
        query = text("""
            SELECT pays_code, pays_nom, annee, indicateur, valeur 
            FROM indicateurs 
            WHERE pays_code = :p AND indicateur = :ind
            ORDER BY annee DESC
            LIMIT 5
        """)
        params_sql = {"p": pays_code, "ind": indicateur}

    with engine.connect() as conn:
        result = conn.execute(query, params_sql)
        donnees = [dict(row._mapping) for row in result]

    reponse = generer_reponse_chat(message, donnees)
    return {"reponse": reponse}