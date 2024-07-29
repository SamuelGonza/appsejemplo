import Trabajadores from "../../Components/Trabajadores/Trabajadores";
import { useEffect, useState } from "react";
import Agenda from "../../Components/Agenda/Agenda";
import RealizarCita from "../../Components/Modales/RealizarCita";
import { Helmet } from "react-helmet";
import AdminEmpresa from "../AdminEmpresa/AdminEmpresa";
import { useNavigate } from "react-router-dom";
import LocalAdminHome from "../LocalAdminHome/LocalAdminHome";
import NavbarMobile from "../../Components/NavbarMobile/NavbarMobile";
import NewPanel from "../AdminEmpresa/NewPanel/NewPanel";

const Url = import.meta.env.VITE_APP_BACKEND_URL;

function Home() {
  const rol = localStorage.getItem("rol");
  const navigate = useNavigate()
  
  if (rol == "Empresa") {
    return <NewPanel />;
  } else if (rol == "AdminLocal") {
    return <LocalAdminHome/>
  } else if (rol == "Trabajador") {
    return (
      <>
        <Helmet title="Inicio Trabajador - Apps for the World" />
        <NavbarMobile />
        <Agenda />
      </>
    );
  } else if (rol == "Cliente") {
    const [trabajadores, setTrabajadores] = useState([]);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [idTrabajador, setTrabajadorId] = useState("");

    const idLocal = JSON.parse(localStorage.getItem("ids"));
    const token = localStorage.getItem("token");

    const obtenerTrabajadores = () => {
      fetch(`${Url}/cliente/trabajadores/${idLocal.idLocal}`, {
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      })
        .then((data) => {
          if (!data.ok) {
            if(data.status === 402){
              navigate("/estado")
            }
            throw new Error("No se trajeron los trabajadores", data.status);
          }
          return data.json();
        })
        .then((response) => {
          setTrabajadores(response);
        })
        .catch((err) => {
          console.log("Hubo un error", err);
        });
    };

    useEffect(() => {
      obtenerTrabajadores();
    }, []);

    const abrirModal = (idTrabajador, estado) => {
      setModalAbierto(estado);
      setTrabajadorId(idTrabajador);
    };
    return (
      <>
        <Helmet title="Inicio Cliente - Apps for the World" />
        <NavbarMobile />
        <Trabajadores trabajadores={trabajadores} abrirModalCita={abrirModal} />
        {modalAbierto && (
          <RealizarCita
            cerrarModal={abrirModal}
            idTrabajador={idTrabajador}
            enviado={false}
            renderizarComponente={obtenerTrabajadores}
          />
        )}
      </>
    );
  }
}

export default Home;