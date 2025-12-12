import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { avc09 } from "../../services";

import LiveEdgeDetector from "../../components/afiliations/LiveEdgeDetector";
import { PointCorrector } from "../../components";
import Swal from "sweetalert2";

const LOCAL_IP = import.meta.env.VITE_IP_URL;
const API_EXCHANGE_URL = `http://${LOCAL_IP}:8000/api/exchange-mobile-token/`;

interface PointsObject {
  // Asumiendo que Points es un array de [number, number]
  x: number;
  y: number;
}

const AVC09MobileUpload: React.FC = () => {
  const { token } = useParams<{ token: string }>(); // El token mágico del path
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id"); // El ID del WS del query param

  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const hasFetched = useRef(false);

  // Estados de Subida/Flujo
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState(
    "Selecciona un archivo o toma una foto.",
  );
  const [mode, setMode] = useState<"select" | "detect" | "correct">("select");
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [tempPoints, setTempPoints] = useState<PointsObject[] | undefined>(
    undefined,
  );

  // NOTE: --- 🚀 EFECTO DE AUTO-LOGIN (CORREGIDO CON useRef) ---
  useEffect(() => {
    // WARNING: Previene la doble ejecución accidental
    if (!token || hasFetched.current) return;

    hasFetched.current = true;

    const performMobileLogin = async () => {
      try {
        const response = await avc09.post(API_EXCHANGE_URL, { token });

        const { access } = response.data;

        localStorage.setItem("token", access);

        avc09.defaults.headers.common["Authorization"] = `Bearer ${access}`;

        setIsAuthenticated(true);
        setMessage("✅ Sesión establecida. Puedes subir archivos.");
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error en el login móvil:",
          text: `${err}`,
        });
        setAuthError(
          "El enlace ha expirado o es inválido. Por favor, genera un nuevo QR.",
        );
      }
    };

    performMobileLogin();

    return () => {
      // Opcional: Limpiar el token al salir, si el usuario no completó la subida
      // localStorage.removeItem("token");
      // delete avc09.defaults.headers.common["Authorization"];
    };
  }, [token, navigate]);

  // NOTE: ---  FUNCIÓN DE SUBIDA (Actualizada) ---
  const uploadToBackend = async (
    fileBlob: Blob,
    finalPoints?: PointsObject[],
  ) => {
    if (!sessionId || !isAuthenticated) {
      alert("Error: Sesión no autenticada o ID de sesión no encontrado.");
      return;
    }

    setIsUploading(true);
    setMessage("Subiendo archivo procesado...");

    const formData = new FormData();
    const file = new File([fileBlob], "upload.jpg", { type: fileBlob.type });
    formData.append("file", file);

    // WARNING: Enviamos el session_id para que el backend sepa a qué PC avisar
    formData.append("session_id", sessionId);

    if (finalPoints) {
      const arrayPoints: number[][] = finalPoints.map((p) => [p.x, p.y]);
      formData.append("points", JSON.stringify(arrayPoints));
      console.log("puntos", arrayPoints);
    }

    try {
      // Usamos la instancia de axios 'avc09' que ya tiene el Header Bearer configurado
      await avc09.post(`/upload/mobile/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("✅ Subida exitosa! El PC está procesando la imagen.");
      setTimeout(() => navigate("/"), 3000); // Volver al inicio después de 3s
    } catch (error) {
      setMessage("❌ Error al subir el archivo.");
      Swal.fire({
        icon: "error",
        title: "Error al subir:",
        text: `${error}`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Caso A: Es un PDF o imagen que no requiere corrección inmediata
    if (file.type === "application/pdf" || file.type.startsWith("image/")) {
      // Directamente al backend (si es imagen, la corrección de puntos puede ser opcional)
      await uploadToBackend(file);
      return;
    }
  };

  const handleCapture = (base64Image: string, points: PointsObject[]) => {
    setTempImage(base64Image);
    setTempPoints(points);
    setMode("correct");
  };

  const handleCorrectionComplete = async (correctedPoints: PointsObject[]) => {
    if (!tempImage) return;

    try {
      const response = await fetch(tempImage);
      const blob = await response.blob();

      // Subimos la imagen original + los puntos corregidos por el usuario
      await uploadToBackend(blob, correctedPoints);
    } catch (error) {
      console.error("Error procesando imagen para subida", error);
      setMessage("Error al procesar la imagen.");
    }
  };

  const buttonStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "15px 30px",
    fontSize: "18px",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    width: "80%",
    textAlign: "center",
    fontWeight: "bold",
  };

  const hiddenInputStyle: React.CSSProperties = {
    display: "none",
  };
  const loadingContainerStyle: React.CSSProperties = {
    padding: "20px",
    textAlign: "center",
    minHeight: "100vh",
    background: "#333",
    color: "white",
  };

  // --- RENDERIZADO ---

  if (authError) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "red" }}>
        <h2>❌ Error de Acceso</h2>
        <p>{authError}</p>
      </div>
    );
  }

  if (isUploading) {
    return (
      <div style={loadingContainerStyle}>
        <h1>Cargando...</h1>
        <p style={{ color: "orange" }}>{message}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>🔄 Autenticando dispositivo...</h2>
        <p>Por favor espera un momento.</p>
      </div>
    );
  }

  // NOTE: Detector en Vivo
  if (mode === "detect") {
    // Asegúrate de que LiveEdgeDetector acepta estos props
    return (
      <LiveEdgeDetector
        onCapture={handleCapture}
        onCancel={() => setMode("select")}
      />
    );
  }

  // NOTE: Corrector de Puntos (PointCorrector)
  if (mode === "correct" && tempImage) {
    // Asumiendo que PointCorrector acepta PointObject[]
    return (
      <div style={{ height: "100vh", width: "100vw", background: "#000" }}>
        <PointCorrector
          imageSrc={tempImage}
          initialPoints={tempPoints}
          onSave={handleCorrectionComplete}
          // onCancel={() => {
          //   setMode("select");
          //   setTempImage(null);
          // }}
        />
      </div>
    );
  }

  // VISTA: Inicio / Selección (mode === "select")
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1 className="dark:text-white">Cámara/Subida Móvil 📱</h1>
      <h3 className="dark:text-white">Conectado a Sesión PC: {sessionId}</h3>
      <p
        style={{ marginBottom: "20px", color: "black" }}
        className="dark:text-gray-300"
      >
        {message}
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        {/* Opción 1: Subir Archivo */}
        <input
          className="dark:text-white"
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          disabled={isUploading}
          style={hiddenInputStyle}
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          style={{ ...buttonStyle, backgroundColor: "#007bff" }}
        >
          📁 Subir Archivo (Galería)
        </label>

        {/* Opción 2: Cámara */}
        <label
          onClick={() => setMode("detect")}
          style={{ ...buttonStyle, backgroundColor: "#28a745" }}
        >
          📸 Tomar Foto (con IA)
        </label>
      </div>
    </div>
  );
};

export default AVC09MobileUpload;
