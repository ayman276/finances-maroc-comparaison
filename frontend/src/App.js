import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Chatbot from "./Chatbot";

const API_URL = "http://127.0.0.1:8000";

const UNITES = {
  chomage: "%",
  croissance_pib: "%",
  deficit_budgetaire: "% du PIB",
  dette_publique: "% du PIB",
  inflation: "%",
  pib_par_habitant: "US$",
  recettes_fiscales: "% du PIB",
  exportations: "% du PIB",
  importations: "% du PIB",
  ide_entrants: "% du PIB",
  acces_electricite: "% population",
  acces_internet: "% population",
  acces_eau_potable: "% population",
  compte_bancaire: "% adultes",
  credit_prive: "% du PIB",
  alphabetisation: "%",
  depenses_education: "% du PIB",
  esperance_vie: "années",
  depenses_sante: "% du PIB",
  population: "habitants",
  urbanisation: "% population",
};

const NOMS_INDICATEURS = {
  chomage: "Taux de chômage",
  croissance_pib: "Croissance du PIB",
  deficit_budgetaire: "Déficit budgétaire",
  dette_publique: "Dette publique",
  inflation: "Inflation",
  pib_par_habitant: "PIB par habitant",
  recettes_fiscales: "Recettes fiscales",
  exportations: "Exportations (% PIB)",
  importations: "Importations (% PIB)",
  ide_entrants: "Investissements étrangers",
  acces_electricite: "Accès à l'électricité",
  acces_internet: "Accès à internet",
  acces_eau_potable: "Accès à l'eau potable",
  compte_bancaire: "Inclusion financière",
  credit_prive: "Crédit au secteur privé",
  alphabetisation: "Taux d'alphabétisation",
  depenses_education: "Dépenses en éducation",
  esperance_vie: "Espérance de vie",
  depenses_sante: "Dépenses de santé",
  population: "Population totale",
  urbanisation: "Taux d'urbanisation",
};

function App() {
  const [pays, setPays] = useState([]);
  const [indicateurs, setIndicateurs] = useState([]);
  const [paysChoisi, setPaysChoisi] = useState("FRA");
  const [indicateurChoisi, setIndicateurChoisi] = useState("inflation");
  const [data, setData] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [avertissement, setAvertissement] = useState("");
  const [analyse, setAnalyse] = useState("");
  const [chargementAnalyse, setChargementAnalyse] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/pays`).then((res) => setPays(res.data));
    axios.get(`${API_URL}/indicateurs`).then((res) => setIndicateurs(res.data));
  }, []);

  const comparer = () => {
    setChargement(true);
    setErreur("");
    setAvertissement("");
    setAnalyse("");

    axios
      .get(`${API_URL}/comparaison`, {
        params: { pays1: "MAR", pays2: paysChoisi, indicateur: indicateurChoisi },
      })
      .then((res) => {
        if (res.data.length === 0) {
          setErreur("Aucune donnée disponible pour cette combinaison.");
          setData([]);
        } else {
          const parAnnee = {};
          res.data.forEach((row) => {
            if (!parAnnee[row.annee]) parAnnee[row.annee] = { annee: row.annee };
            parAnnee[row.annee][row.pays_code] = row.valeur;
          });
          const dataFormatee = Object.values(parAnnee).sort((a, b) => a.annee - b.annee);
          setData(dataFormatee);

          const aDataMAR = dataFormatee.some((d) => d.MAR !== undefined);
          const aDataAutre = dataFormatee.some((d) => d[paysChoisi] !== undefined);
          if (!aDataMAR || !aDataAutre) {
            const paysManquant = !aDataMAR
              ? "le Maroc"
              : pays.find((p) => p.pays_code === paysChoisi)?.pays_nom || paysChoisi;
            setAvertissement(
              `⚠️ Donnée "${indicateurChoisi}" non disponible pour ${paysManquant}.`
            );
          }

          setChargementAnalyse(true);
          axios
            .get(`${API_URL}/analyse`, {
              params: { pays1: "MAR", pays2: paysChoisi, indicateur: indicateurChoisi },
            })
            .then((res2) => setAnalyse(res2.data.analyse))
            .catch(() => setAnalyse("Impossible de générer l'analyse."))
            .finally(() => setChargementAnalyse(false));
        }
      })
      .catch(() => setErreur("Erreur lors de la récupération des données."))
      .finally(() => setChargement(false));
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.title}>🇲🇦 Finances Publiques du Maroc</h1>
          <p style={styles.subtitle}>
            Comparez les indicateurs financiers du Maroc avec n'importe quel pays du monde
          </p>
        </header>

        {/* Contrôles */}
        <div style={styles.card}>
          <div style={styles.controlsRow}>
            <div style={styles.controlGroup}>
              <label style={styles.label}>Pays à comparer</label>
              <select
                style={styles.select}
                value={paysChoisi}
                onChange={(e) => setPaysChoisi(e.target.value)}
              >
                {pays.map((p) => (
                  <option key={p.pays_code} value={p.pays_code}>
                    {p.pays_nom}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.label}>Indicateur</label>
              <select
                style={styles.select}
                value={indicateurChoisi}
                onChange={(e) => setIndicateurChoisi(e.target.value)}
              >
                {indicateurs.map((ind) => (
                  <option key={ind} value={ind}>
                    {NOMS_INDICATEURS[ind] || ind}
                  </option>
                ))}
              </select>
            </div>

            <button style={styles.button} onClick={comparer} disabled={chargement}>
              {chargement ? "Chargement..." : "Comparer"}
            </button>
          </div>
        </div>

        {erreur && <div style={styles.errorBox}>{erreur}</div>}

        {data.length > 0 && (
          <>
            <div style={styles.card}>
              <div style={styles.chartHeader}>
                <h2 style={styles.chartTitle}>
                  {NOMS_INDICATEURS[indicateurChoisi] || indicateurChoisi}
                </h2>
                <span style={styles.unitBadge}>{UNITES[indicateurChoisi] || ""}</span>
              </div>

              {avertissement && (
                <div style={styles.warningBox}>{avertissement}</div>
              )}

              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="annee" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={styles.tooltip}
                    formatter={(value, name) => [
                      `${value.toFixed(2)} ${UNITES[indicateurChoisi] || ""}`,
                      name,
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="MAR"
                    stroke="#C1272D"
                    name="Maroc"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey={paysChoisi}
                    stroke="#1B3A5C"
                    name={pays.find((p) => p.pays_code === paysChoisi)?.pays_nom || paysChoisi}
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={styles.card}>
              <div style={styles.analyseHeader}>
                <span style={styles.aiIcon}>✨</span>
                <h3 style={styles.analyseTitle}>Analyse générée par IA</h3>
              </div>
              {chargementAnalyse && (
                <p style={styles.loadingText}>Génération de l'analyse en cours...</p>
              )}
              {analyse && <p style={styles.analyseText}>{analyse}</p>}
            </div>
          </>
        )}
      </div>
      <Chatbot />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#F5F5F7",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    padding: "40px 20px",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1F1F1F",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "15px",
    color: "#666",
    margin: 0,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #EEEEEE",
  },
  controlsRow: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  controlGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: "1",
    minWidth: "180px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#555",
  },
  select: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #DDD",
    fontSize: "14px",
    backgroundColor: "#FAFAFA",
    cursor: "pointer",
  },
  button: {
    padding: "11px 28px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#C1272D",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  chartTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1F1F1F",
    margin: 0,
  },
  unitBadge: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#006233",
    backgroundColor: "#E8F5E9",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  errorBox: {
    backgroundColor: "#FDEDED",
    color: "#C1272D",
    padding: "14px 18px",
    borderRadius: "10px",
    marginBottom: "20px",
    fontSize: "14px",
    border: "1px solid #F5C6C6",
  },
  warningBox: {
    backgroundColor: "#FFF8E1",
    color: "#8A6D00",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "16px",
    fontSize: "13px",
    border: "1px solid #FFE082",
  },
  tooltip: {
    borderRadius: "8px",
    border: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  analyseHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  aiIcon: {
    fontSize: "20px",
  },
  analyseTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1F1F1F",
    margin: 0,
  },
  loadingText: {
    color: "#999",
    fontSize: "14px",
    fontStyle: "italic",
  },
  analyseText: {
    fontSize: "15px",
    lineHeight: "1.7",
    color: "#333",
    margin: 0,
  },
};

export default App;