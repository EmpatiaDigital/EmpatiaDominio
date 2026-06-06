import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import errorImg from "../assets/error.jpg";
import "../style/Error404.css";

// ── Configuración del juego ──
const ROWS = 8;
const COLS = 8;
const TOTAL_CELLS = ROWS * COLS;
const ROBOT_COUNT = 5;
const POINTS_PER_MISS = 100;
const WIN_SCORE = 500;

// Rutas válidas de la app
const VALID_ROUTES = [
  "/", "/data-user", "/registro", "/reestablecer", "/descargas",
  "/login", "/socio/dashboard", "/superadmin/dashboard", "/admin/dashboard",
  "/crear", "/editar-publicaciones", "/contacto", "/crear-actividades",
  "/actividades", "/inscription", "/informacion", "/superadmincourses",
  "/cursantes", "/congelar", "/post", "/descargo-de-responsabilidad",
];

function isValidRoute(pathname) {
  if (VALID_ROUTES.includes(pathname)) return true;
  if (/^\/post\/.+/.test(pathname)) return true;
  if (/^\/editar\/.+/.test(pathname)) return true;
  return false;
}

function buildBoard() {
  const cells = Array(TOTAL_CELLS).fill(null).map((_, i) => ({
    id: i,
    isRobot: false,
    revealed: false,
    flagged: false,
    adjacentRobots: 0,
  }));

  let placed = 0;
  while (placed < ROBOT_COUNT) {
    const idx = Math.floor(Math.random() * TOTAL_CELLS);
    if (!cells[idx].isRobot) {
      cells[idx].isRobot = true;
      placed++;
    }
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      if (cells[idx].isRobot) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            if (cells[nr * COLS + nc].isRobot) count++;
          }
        }
      }
      cells[idx].adjacentRobots = count;
    }
  }

  return cells;
}

function revealEmpty(cells, idx) {
  const visited = new Set();
  const queue = [idx];
  while (queue.length > 0) {
    const cur = queue.shift();
    if (visited.has(cur)) continue;
    visited.add(cur);
    cells[cur].revealed = true;
    if (cells[cur].adjacentRobots === 0 && !cells[cur].isRobot) {
      const r = Math.floor(cur / COLS);
      const c = cur % COLS;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            const nIdx = nr * COLS + nc;
            if (!visited.has(nIdx) && !cells[nIdx].isRobot) {
              queue.push(nIdx);
            }
          }
        }
      }
    }
  }
  return cells;
}

export default function Error404() {
  const navigate = useNavigate();
  const location = useLocation();
  const isInvalidRoute = !isValidRoute(location.pathname);

  const [online, setOnline] = useState(navigator.onLine);
  const [serverBack, setServerBack] = useState(false);
  const [board, setBoard] = useState(() => buildBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [robotsFound, setRobotsFound] = useState(0);
  const [message, setMessage] = useState("");
  const retryRef = useRef(null);

  // ── Escuchar conexión — solo actualiza estado, NO recarga ──
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => {
      setOnline(false);
      setServerBack(false);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ── Polling silencioso — detecta si el servidor volvió, NO recarga ──
  useEffect(() => {
    if (isInvalidRoute) return;

    retryRef.current = setInterval(async () => {
      try {
        const res = await fetch(window.location.href, {
          method: "HEAD",
          cache: "no-store",
        });
        if (res.ok) {
          clearInterval(retryRef.current);
          setServerBack(true);
        }
      } catch (_) {}
    }, 5000);

    return () => clearInterval(retryRef.current);
  }, [isInvalidRoute]);

  // ── Al terminar el juego: recarga o navega según contexto ──
  const handleGameEnd = useCallback(() => {
    if (isInvalidRoute) {
      navigate("/");
      return;
    }
    window.location.reload();
  }, [isInvalidRoute, navigate]);

  const resetGame = useCallback(() => {
    setBoard(buildBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
    setRobotsFound(0);
    setMessage("");
  }, []);

  const handleCellClick = useCallback(
    (idx) => {
      if (gameOver || won || board[idx].revealed || board[idx].flagged) return;

      setBoard((prev) => {
        const next = prev.map((c) => ({ ...c }));

        if (next[idx].isRobot) {
          next[idx].revealed = true;
          const newFound = robotsFound + 1;
          setRobotsFound(newFound);
          setMessage("¡Encontraste un robot! 🤖");
          if (newFound >= ROBOT_COUNT) {
            setGameOver(true);
            next.forEach((c) => (c.revealed = true));
          }
          return next;
        }

        const updated = revealEmpty(next, idx);
        setScore((s) => {
          const newScore = s + POINTS_PER_MISS;
          setMessage(`+${POINTS_PER_MISS} puntos! Total: ${newScore}`);
          if (newScore >= WIN_SCORE) {
            setWon(true);
          }
          return newScore;
        });
        return updated;
      });
    },
    [board, gameOver, won, robotsFound]
  );

  const handleFlag = useCallback(
    (e, idx) => {
      e.preventDefault();
      if (gameOver || won || board[idx].revealed) return;
      setBoard((prev) =>
        prev.map((c, i) => (i === idx ? { ...c, flagged: !c.flagged } : c))
      );
    },
    [board, gameOver, won]
  );

  const adjacentColor = [
    "",
    "#4a90d9",
    "#2ecc71",
    "#e74c3c",
    "#1e3a5f",
    "#8e44ad",
    "#16a085",
    "#2c3e50",
    "#7f8c8d",
  ];

  // ── Textos dinámicos según contexto ──
  const heroEyebrow = isInvalidRoute ? "Página no encontrada" : "Error de conexión";
  const heroTitle = isInvalidRoute
    ? "Esta página no existe"
    : "No pudimos cargar la página";
  const heroSubtitle = isInvalidRoute
    ? "La dirección que ingresaste no corresponde a ninguna sección de la web. Jugá mientras te llevamos al inicio."
    : online
    ? serverBack
      ? "El servidor volvió. Terminá el juego y recargamos la página automáticamente."
      : "El servidor no responde. Seguimos reintentando. Terminá el juego para recargar."
    : "Sin conexión a internet. Revisá tu red. Terminá el juego para reintentar.";

  const statusLabel = isInvalidRoute
    ? "URL inválida"
    : online
    ? serverBack
      ? "Servidor disponible · terminá el juego"
      : "En línea · esperando servidor"
    : "Sin conexión";

  return (
    <div className="error-page">
      {/* ── Hero ── */}
      <div className="error-hero">
        <img src={errorImg} alt="Error" className="error-hero-img" />
        <div className="error-hero-overlay" />
        <div className="error-hero-content">
          <span className="error-eyebrow">{heroEyebrow}</span>
          <h1 className="error-title">{heroTitle}</h1>
          <p className="error-subtitle">{heroSubtitle}</p>

          <div className="error-status">
            <span className={`status-dot ${online && !isInvalidRoute ? "online" : "offline"}`} />
            <span className="status-label">{statusLabel}</span>
          </div>

          {isInvalidRoute ? (
            <button className="btn-hero" onClick={() => navigate("/")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Ir al inicio
            </button>
          ) : (
            <button className="btn-hero" onClick={() => window.location.reload()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Reintentar ahora
            </button>
          )}
        </div>
      </div>

      {/* ── Juego ── */}
      <div className="game-section">
        <div className="game-header">
          <div>
            <span className="section-eyebrow">Mientras esperás</span>
            <h2 className="section-title">Encuentra el Robot</h2>
            <p className="game-desc">
              Hay <strong>{ROBOT_COUNT} robots</strong> escondidos en la grilla. Hacé clic en las celdas seguras para sumar puntos. Llegá a <strong>{WIN_SCORE} puntos</strong> sin encontrar todos los robots para ganar.{" "}
              {isInvalidRoute
                ? "Al terminar te llevamos al inicio."
                : "Al terminar recargamos la página."}
              {" "}Clic derecho para marcar una celda.
            </p>
          </div>
          <div className="game-stats">
            <div className="stat-card">
              <span className="stat-label">Puntos</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Robots</span>
              <span className="stat-value">{robotsFound}/{ROBOT_COUNT}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Meta</span>
              <span className="stat-value">{WIN_SCORE}</span>
            </div>
          </div>
        </div>

        {message && (
          <div className={`game-message ${won ? "msg-win" : gameOver ? "msg-lose" : "msg-info"}`}>
            {won
              ? `🏆 ¡Ganaste! Llegaste a ${WIN_SCORE} puntos.`
              : gameOver
              ? "💀 ¡Encontraste todos los robots! Fin del juego."
              : message}
          </div>
        )}

        <div className="game-board">
          {board.map((cell, idx) => {
            let cellClass = "game-cell";
            if (cell.revealed) cellClass += " revealed";
            if (cell.flagged && !cell.revealed) cellClass += " flagged";
            if (cell.revealed && cell.isRobot) cellClass += " robot";

            return (
              <button
                key={cell.id}
                className={cellClass}
                onClick={() => handleCellClick(idx)}
                onContextMenu={(e) => handleFlag(e, idx)}
                aria-label={`Celda ${idx}`}
              >
                {cell.revealed && cell.isRobot && (
                  <span className="robot-icon">🤖</span>
                )}
                {cell.revealed && !cell.isRobot && cell.adjacentRobots > 0 && (
                  <span
                    className="adjacent-num"
                    style={{ color: adjacentColor[cell.adjacentRobots] }}
                  >
                    {cell.adjacentRobots}
                  </span>
                )}
                {!cell.revealed && cell.flagged && (
                  <span className="flag-icon">🚩</span>
                )}
              </button>
            );
          })}
        </div>

        {(gameOver || won) && (
          <div className="game-actions">
            <button className="btn-reset btn-reset--primary" onClick={handleGameEnd}>
              {isInvalidRoute
                ? "🏠 Ir al inicio"
                : online
                ? "🔄 Recargar página"
                : "🔄 Reintentar conexión"}
            </button>
            <button className="btn-reset" onClick={resetGame}>
              Jugar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
