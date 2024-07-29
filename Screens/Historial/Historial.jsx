import { Helmet } from "react-helmet";
import "./Historial.css";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AccessAlarmsOutlinedIcon from "@mui/icons-material/AccessAlarmsOutlined";
import { useEffect, useState } from "react";
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';
import CommentOutlinedIcon from '@mui/icons-material/CommentOutlined';
import NavbarMobile from "../../Components/NavbarMobile/NavbarMobile";
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import dayjs from "dayjs";
import 'dayjs/locale/es'
dayjs.locale('es')
const Url = import.meta.env.VITE_APP_BACKEND_URL;

export default function Historial() {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const ids = JSON.parse(localStorage.getItem("ids"));
  const token = localStorage.getItem("token");

  const obtenerHistorial = async () => {
    try {
      const response = await fetch(
        `${Url}/cliente/historial/${ids.idCliente}`,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
        }
      );

      if (!response.ok) {
        throw new Error("No hay historial");
      } else {
        const data = await response.json();
        setHistorial(data);
        setCargando(false);
      }
    } catch (err) {
      setHistorial([]);
      setCargando(false);
    }
  };

  const eliminarHistorial = async () => {
    try {
      const response = await fetch(
        `${Url}/cliente/historial/${ids.idCliente}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
        }
      );

      if (response.ok) {
        setHistorial([]);
      } else {
        throw new Error("No se pudo eliminar el historial");
      }
    } catch (er) {
      console.log(er.message);
    }
  };

  useEffect(() => {
    obtenerHistorial();
  }, []);

  return (
    <>
      <Helmet title="Mi historial de citas - Apps for the World" />
      <NavbarMobile />
      <main style={{ width: "400px", position: "relative"}}>
        <div className="controles">
          <h3>Historial</h3>
          {historial.length > 0 && (
            <button
              onClick={eliminarHistorial}
              className="btnEliminar"
              title="Limpiar el historial"
            >
              <DeleteOutlinedIcon sx={{ fontSize: "25px" }} />
            </button>
          )}
        </div>
        {cargando ? (
          <div className="loader"></div>
        ) : historial.length === 0 ? (
          <h3 className="sinDatos">
            Tu historial esta limpio
          </h3>
        ) : (
          historial.map((cita, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                marginTop: "40px",
              }}
              className={`appointment historialTarjeta`}
            >
              <div className="timeElement">{cita.hora}</div>
              <div className="local">{cita.nombreLocal}</div>
              <div className="imgLocal">
                <img src={cita.imgLocal} alt="" />
              </div>
              <div className="centerDiv">
                <AssignmentIndOutlinedIcon /> {cita.nombreTrabajador || "Desconocido"}
              </div>
              <div className="centerDiv">
                <AccessAlarmsOutlinedIcon /> {cita.fecha || dayjs().format("dddd [de], MM")}
              </div>
              <div className="centerDiv">
                <FormatListBulletedOutlinedIcon /> {cita.servicios || "Ninguno"}
              </div>
              <div className="centerDiv">
                <CommentOutlinedIcon /> {cita.detalles === "Se define en persona" ? "Se definio en persona": cita.detalles || "Desconocido"}
              </div>
            </div>
          ))
        )}
      </main>
    </>
  );
}