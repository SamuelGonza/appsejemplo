import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
const Url = import.meta.env.VITE_APP_BACKEND_URL;
import "./Intermediario.css";

function Intermediario() {
  const [empresaData, setEmpresaData] = useState({});
  const { idLocal } = useParams();
  const [localImage, setLocalImage] = useState("");

  const traerInfoLocal = async () => {
    try {
      const response = await fetch(`${Url}/empresa/info/${idLocal}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("No se pudo traer la info de la empresa");
      } else {
        const data = await response.json();
        setEmpresaData(data);
        setLocalImage(data.localImg);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    traerInfoLocal();
  }, []);

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `url(${empresaData.imgLogin})`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            width: "600px",
            border: "solid rgba(0,0,0,0.2)",
            height: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            padding: "40px 0"

          }}
        >
          <h3>{empresaData.nombreLocal}</h3>
          <div className="logo-local">
            {localImage && <img src={localImage} alt="Local" />}
          </div>
          <h4>Selecciona una opción</h4>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap",
              gap: "20px"
            }}
          >
            <NavLink
              to={`/login/cliente/${idLocal}`}
              style={{
                width: "230px",
                padding: "10px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                textAlign: "center"
              }}
              className="mt-4"
              type="submit"
            >
              Iniciar Sesion
            </NavLink>
            <NavLink
              to={empresaData.localRuta}
              style={{
                width: "230px",
                padding: "10px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
              className="mt-4"
              type="submit"
            >
              Registrarse
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
}

export default Intermediario;