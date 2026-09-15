import requests
import pandas as pd

INDICATORS = {
    # --- Indicateurs financiers existants ---
    "dette_publique": ["GC.DOD.TOTL.GD.ZS"],
    "recettes_publiques": ["GC.REV.XGRT.GD.ZS"],
    "depenses_publiques": ["GC.XPN.TOTL.GD.ZS"],
    "recettes_fiscales": ["GC.TAX.TOTL.GD.ZS"],
    "pib_par_habitant": ["NY.GDP.PCAP.CD"],
    "croissance_pib": ["NY.GDP.MKTP.KD.ZG"],
    "chomage": ["SL.UEM.TOTL.ZS"],
    "inflation": ["FP.CPI.TOTL.ZG"],

    # --- Commerce et ouverture économique ---
    "exportations": ["NE.EXP.GNFS.ZS"],
    "importations": ["NE.IMP.GNFS.ZS"],
    "ide_entrants": ["BX.KLT.DINV.WD.GD.ZS"],

    # --- Infrastructures et accès aux services ---
    "acces_electricite": ["EG.ELC.ACCS.ZS"],
    "acces_internet": ["IT.NET.USER.ZS"],
    "acces_eau_potable": ["SH.H2O.BASW.ZS"],

    # --- Inclusion financière ---
    "compte_bancaire": ["FX.OWN.TOTL.ZS"],
    "credit_prive": ["FS.AST.PRVT.GD.ZS"],

    # --- Éducation ---
    "alphabetisation": ["SE.ADT.LITR.ZS"],
    "depenses_education": ["SE.XPD.TOTL.GD.ZS"],

    # --- Santé ---
    "esperance_vie": ["SP.DYN.LE00.IN"],
    "depenses_sante": ["SH.XPD.CHEX.GD.ZS"],

    # --- Démographie ---
    "population": ["SP.POP.TOTL"],
    "urbanisation": ["SP.URB.TOTL.IN.ZS"],
}


def get_valid_countries():
    """Récupère la liste des vrais pays (exclut les régions/agrégats comme 'World', 'Arab World'...)"""
    url = "https://api.worldbank.org/v2/country"
    params = {"format": "json", "per_page": 300}
    response = requests.get(url, params=params, timeout=30)
    data = response.json()[1]

    valid_codes = set()
    for entry in data:
        if entry["region"]["value"] != "Aggregates":
            valid_codes.add(entry["id"])
    return valid_codes


def try_fetch_single_code(indicator_code, valid_countries):
    url = f"https://api.worldbank.org/v2/country/all/indicator/{indicator_code}"
    params = {"format": "json", "per_page": 20000}

    try:
        response = requests.get(url, params=params, timeout=60)
        response.raise_for_status()
        json_data = response.json()
    except Exception as e:
        print(f"  ✗ Erreur réseau pour le code {indicator_code}: {e}")
        return None

    if len(json_data) < 2 or json_data[1] is None:
        print(f"  ✗ Code invalide ou sans données: {indicator_code}")
        return None

    data = json_data[1]
    rows = []
    for entry in data:
        if entry["value"] is not None and entry["countryiso3code"] in valid_countries:
            rows.append({
                "pays_code": entry["countryiso3code"],
                "pays_nom": entry["country"]["value"],
                "annee": entry["date"],
                "indicateur": None,
                "valeur": entry["value"]
            })

    if len(rows) == 0:
        print(f"  ✗ Code valide mais 0 ligne de données: {indicator_code}")
        return None

    return pd.DataFrame(rows)


def fetch_indicator(indicator_name, code_list, valid_countries):
    for code in code_list:
        print(f"  Essai du code {code}...")
        df = try_fetch_single_code(code, valid_countries)
        if df is not None:
            df["indicateur"] = indicator_name
            print(f"  ✓ Succès avec {code} ({len(df)} lignes)")
            return df

    print(f"  ⚠️ AUCUN code n'a fonctionné pour {indicator_name}")
    return pd.DataFrame()


def collect_all():
    print("Récupération de la liste des pays valides...")
    valid_countries = get_valid_countries()
    print(f"{len(valid_countries)} pays valides trouvés\n")

    all_data = []
    for name, code_list in INDICATORS.items():
        print(f"Récupération de {name}...")
        df = fetch_indicator(name, code_list, valid_countries)
        if not df.empty:
            all_data.append(df)
        print()

    if not all_data:
        print("Aucune donnée récupérée au total.")
        return pd.DataFrame()

    return pd.concat(all_data, ignore_index=True)


def calculer_deficit(df):
    """Calcule le déficit budgétaire = recettes - dépenses, à partir des 2 indicateurs séparés."""
    pivot = df[df["indicateur"].isin(["recettes_publiques", "depenses_publiques"])].pivot_table(
        index=["pays_code", "pays_nom", "annee"],
        columns="indicateur",
        values="valeur"
    ).reset_index()

    pivot = pivot.dropna(subset=["recettes_publiques", "depenses_publiques"])
    pivot["valeur"] = pivot["recettes_publiques"] - pivot["depenses_publiques"]
    pivot["indicateur"] = "deficit_budgetaire"

    deficit_df = pivot[["pays_code", "pays_nom", "annee", "indicateur", "valeur"]]
    return deficit_df


if __name__ == "__main__":
    df = collect_all()

    if not df.empty:
        deficit_df = calculer_deficit(df)
        print(f"Déficit budgétaire calculé pour {len(deficit_df)} lignes (pays/années)\n")
        df = pd.concat([df, deficit_df], ignore_index=True)

    df.to_csv("finances_data.csv", index=False)
    print(f"\n{len(df)} lignes récupérées et sauvegardées dans finances_data.csv")

    if not df.empty:
        print("\nRésumé par indicateur:")
        print(df.groupby("indicateur")["pays_code"].nunique())