import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// 💡 Define la ruta final a la que quieres redirigir
// ASEGÚRATE de que esta ruta es la que corresponde a tu AVC09MovileUpload.tsx
const MOBILE_UPLOAD_PATH = "/avc09/upload-mobile";
const SESSION_STORAGE_KEY = "avc09_mobile_session_token";

const MobileLink: React.FC = () => {
  // Para leer los parámetros de la URL (?token=...)
  const [searchParams] = useSearchParams();
  // Para redirigir programáticamente
  const navigate = useNavigate();

  // Estado para mostrar un mensaje amigable
  const [message, setMessage] = useState("Enlazando sesión móvil...");

  const mobileSessionToken = React.useRef(
    localStorage.getItem(SESSION_STORAGE_KEY),
  );

  const uploadToBackend = async (fileBlob: Blob, finalPoints?: Points) => {
    // 🛑 COMPROBACIÓN CRÍTICA
    if (!mobileSessionToken.current) {
      setMessage(
        "❌ Token de sesión móvil no encontrado. Por favor, escanee el QR nuevamente.",
      );
      setIsUploading(false);
      return; // Detener la subida
    }

    setIsUploading(true);
    setMessage("Subiendo archivo procesado...");

    const formData = new FormData();
    // ... (Creación de FormData)
    const file = new File([fileBlob], "upload.jpg", { type: fileBlob.type });
    formData.append("file", file);

    if (finalPoints) {
      formData.append("points", JSON.stringify(finalPoints));
    }

    try {
      await avc09.post(`/upload/mobile/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          // 🔑 CAMBIO CLAVE: Enviamos el token en un encabezado personalizado
          "X-Mobile-Session-Token": mobileSessionToken.current,
        },
      });

      setMessage("✅ ¡Subida exitosa! Vuelve a tu PC.");
      setTimeout(() => navigate("/"), 3000);
    } catch (error: any) {
      console.error("Error al subir:", error);

      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        setMessage(
          "❌ Error: Sesión expirada o token inválido. Re-escanea el QR.",
        );
      } else {
        setMessage("❌ Error al subir el archivo.");
      }
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const SESSION_TOKEN = searchParams.get("token");

    if (SESSION_TOKEN) {
      // 1. Almacenar el token de sesión
      // Este token es el que usará AVC09MovileUpload.tsx para identificar
      // la sesión de PC y enviar la imagen por el canal WebSocket o API.
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, SESSION_TOKEN);
        console.log("✅ Token de sesión móvil guardado:", SESSION_TOKEN);

        setMessage("¡Sesión enlazada! Redirigiendo a la subida de archivos...");

        // 2. Redirigir al componente final
        // El 'replace: true' asegura que el usuario no pueda volver a esta página con el botón 'atrás'
        setTimeout(() => {
          navigate(MOBILE_UPLOAD_PATH, { replace: true });
        }, 100); // Pequeño delay para asegurar que el state se actualice o para UX
      } catch (error) {
        console.error("❌ Error al guardar el token en localStorage:", error);
        setMessage("Error: No se pudo guardar el token en el dispositivo.");
      }
    } else {
      // Error si se accede a la ruta sin el token
      setMessage(
        "❌ Error: El enlace QR es inválido o el token no se encontró.",
      );
      console.error("❌ Token de sesión no encontrado en la URL.");
      // Opcional: Redirigir a una página de error o login manual
      // setTimeout(() => {
      //      navigate('/auth/mobile-login', { replace: true });
      // }, 2000);
    }
  }, [searchParams, navigate]);

  return (
    <div
      style={{
        textAlign: "center",
        padding: "50px",
        backgroundColor: "#1f2937",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "15px" }}>
        {message.includes("Error")
          ? "⚠️ Proceso Fallido"
          : "🔗 Enlazando Dispositivo"}
      </h1>
      <p>{message}</p>
    </div>
  );
};

export default MobileLink;
