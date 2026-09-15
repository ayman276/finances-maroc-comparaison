import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function Chatbot() {
  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Bonjour 👋 Posez-moi une question sur les finances publiques (ex: \"Quelle est l'inflation au Maroc en 2022 ?\")" },
  ]);
  const [saisie, setSaisie] = useState("");
  const [chargement, setChargement] = useState(false);
  const finDesMessages = useRef(null);

  useEffect(() => {
    finDesMessages.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const envoyerMessage = () => {
    if (!saisie.trim()) return;

    const nouveauMessage = { role: "user", text: saisie };
    setMessages((prev) => [...prev, nouveauMessage]);
    setChargement(true);
    setSaisie("");

    axios
      .post(`${API_URL}/chatbot`, { message: saisie })
      .then((res) => {
        setMessages((prev) => [...prev, { role: "bot", text: res.data.reponse }]);
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: "Désolé, une erreur est survenue. Réessayez." },
        ]);
      })
      .finally(() => setChargement(false));
  };

  const gererTouche = (e) => {
    if (e.key === "Enter") envoyerMessage();
  };

  return (
    <>
      {/* Bouton flottant */}
      <button style={styles.bulle} onClick={() => setOuvert(!ouvert)}>
        {ouvert ? "✕" : "💬"}
      </button>

      {/* Fenêtre de chat */}
      {ouvert && (
        <div style={styles.fenetre}>
          <div style={styles.entete}>
            <span style={styles.enteteTitre}>🇲🇦 Assistant Finances</span>
          </div>

          <div style={styles.corps}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.messageBulle,
                  ...(msg.role === "user" ? styles.messageUser : styles.messageBot),
                }}
              >
                {msg.text}
              </div>
            ))}
            {chargement && (
              <div style={{ ...styles.messageBulle, ...styles.messageBot }}>
                En train d'écrire...
              </div>
            )}
            <div ref={finDesMessages} />
          </div>

          <div style={styles.piedDePage}>
            <input
              style={styles.input}
              type="text"
              placeholder="Posez votre question..."
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              onKeyDown={gererTouche}
            />
            <button style={styles.boutonEnvoyer} onClick={envoyerMessage}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  bulle: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#C1272D",
    color: "#FFF",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    zIndex: 1000,
  },
  fenetre: {
    position: "fixed",
    bottom: "90px",
    right: "24px",
    width: "340px",
    height: "460px",
    backgroundColor: "#FFF",
    borderRadius: "16px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    zIndex: 1000,
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  entete: {
    backgroundColor: "#C1272D",
    color: "#FFF",
    padding: "16px",
  },
  enteteTitre: {
    fontWeight: "600",
    fontSize: "15px",
  },
  corps: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "#F9F9F9",
  },
  messageBulle: {
    maxWidth: "80%",
    padding: "10px 14px",
    borderRadius: "14px",
    fontSize: "13px",
    lineHeight: "1.5",
  },
  messageUser: {
    alignSelf: "flex-end",
    backgroundColor: "#C1272D",
    color: "#FFF",
    borderBottomRightRadius: "4px",
  },
  messageBot: {
    alignSelf: "flex-start",
    backgroundColor: "#EEE",
    color: "#333",
    borderBottomLeftRadius: "4px",
  },
  piedDePage: {
    display: "flex",
    padding: "12px",
    borderTop: "1px solid #EEE",
    gap: "8px",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "20px",
    border: "1px solid #DDD",
    fontSize: "13px",
    outline: "none",
  },
  boutonEnvoyer: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    backgroundColor: "#C1272D",
    color: "#FFF",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default Chatbot;