import { useNavigate, NavLink } from "react-router-dom";
import "./NavbarMobile.css";
import AppsLogo from "../../assets/navbar-assets/Apps.svg";
import Carrito from "../Carrito/Carrito";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const Url = import.meta.env.VITE_APP_BACKEND_URL;

function NavbarMobile() {
    const [width] = useState(window.innerWidth);
    const [userInfo, setUserInfo] = useState({})
    const [imgProfile, setImgProfile] = useState("")
    const [parrafoTexto, setParrafoTexto] = useState("ㅤㅤㅤ");

    const ids = JSON.parse(localStorage.getItem("ids"))
    const rol = localStorage.getItem("rol");

    const navigate = useNavigate();

    const notify = (mensaje) => toast.error(mensaje);
    const success = (mensaje) => toast.success(mensaje)

    const traerInfoUsuario = async () => {
      let idUser = ""

      if(rol === "AdminLocal"){
          idUser = ids.idAdmin
      }else if(rol === "Trabajador"){
        idUser = ids.idTabajador
      }else{
        idUser = ids.idCliente
      }

        try {
            const response = await fetch(`${Url}/profile/userInfo/${idUser}`, {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({rol})
            });

            const data = await response.json();

            if (!response.ok) {
              throw new Error(data.mensaje)
            }else{
              setUserInfo(data)

              if(rol === "AdminLocal"){
                setImgProfile(data.imgAdminLocal)
              }else if(rol === "Trabajador"){
                setImgProfile(data.imgTrabajador)
              }else{
                setImgProfile(data.imgCliente)
            }
            }
        } catch (error) {
          console.log(error)
          notify(error.message)
        }
    };

    const cerrarSesion = () => {
        const ids = JSON.parse(localStorage.getItem("ids"));

        if (rol === "Empresa") {
            navigate(`/login/empresa/${ids.idEmpresa}`);
        } else if (rol === "AdminLocal") {
            navigate(`/login/local/${ids.idLocal}`);
        } else if (rol === "Trabajador") {
            navigate(`/login/trabajador/${ids.idLocal}`);
        } else {
            navigate(`/login/cliente/${ids.idLocal}`);
        }

        localStorage.removeItem("token");
        localStorage.removeItem("ids");
        localStorage.removeItem("rol");
    };

    useEffect(() => {
        if (width < 1025) {
            setParrafoTexto("");
        }
    }, [width]);

    useEffect(() => {
      traerInfoUsuario()
    }, [])

    return (
        <div className="bottom-nav">
            <div className="menu-list">
                {rol === "AdminLocal" && (
                    <>
                        <div className="menu">
                            <NavLink to="/inicio" className="frame">
                                <i className="ri-home-3-line"></i>
                                <p className="li-mobile-p">Inicio</p>
                            </NavLink>
                        </div>
                        <div className="menu">
                            <NavLink to="/productos" className="frame">
                                <i className="ri-store-2-line"></i>
                                <p className="li-mobile-p">Ventas</p>
                            </NavLink>
                        </div>
                        <div className="menu">
                            <NavLink to="/empleados" className="frame">
                                <i className="ri-calendar-event-line"></i>
                                <p className="li-mobile-p">Agenda</p>
                            </NavLink>
                        </div>
                        <div className="menu">
                            <NavLink to="/clientes" className="frame">
                                <i className="ri-group-line"></i>
                                <p className="li-mobile-p">Clientes</p>
                            </NavLink>
                        </div>
                        <div className="menu">
                            <NavLink to="/listaQrs" className="frame">
                                <i className="ri-qr-code-line"></i>
                                <p className="li-mobile-p">Qrs</p>
                            </NavLink>
                        </div>
                        <div className="menu">
                            <NavLink to="/estadistica" className="frame">
                                <i className="ri-bar-chart-2-line"></i>
                                <p className="li-mobile-p">Estadistica</p>
                            </NavLink>
                        </div>
                        <div className="menu">
                            <div className="frame">
                                <Carrito />
                                <p>{parrafoTexto}</p>
                            </div>
                        </div>
                        <NavLink to="/MiPerfil" className="frame">
                            <div className="imgNavbarProfile">
                              <img src={imgProfile ? imgProfile: ""} alt="" />
                            </div>
                            <p className="li-mobile-p">Mi perfil</p>
                        </NavLink>
                        <div className="menu">
                            <div
                                onClick={cerrarSesion}
                                style={{ cursor: "pointer" }}
                                className="frame"
                            >
                                <i className="ri-logout-box-line"></i>
                                <p className="li-mobile-p">Salir</p>
                            </div>
                        </div>
                    </>
                )}
                {rol === "Trabajador" && (
                    <>
                        <div className="menu">
                            <NavLink to="/inicio" className="frame">
                                <i className="ri-home-3-line"></i>
                                <p className="li-mobile-p">Inicio</p>
                            </NavLink>
                        </div>
                        <div className="menu">
                            <NavLink to="/miHorario" className="frame">
                                <i className="ri-calendar-view"></i>
                                <p className="li-mobile-p">Mi Horario</p>
                            </NavLink>
                        </div>
                        <div className="contenedor-logos">
                            <img
                                className="logo1"
                                src={AppsLogo}
                                alt="Apps for the world Logo"
                            />
                        </div>
                        <div className="menu">
                            <NavLink to="/MiPerfil" className="frame">
                            <div className="imgNavbarProfile">
                              <img src={imgProfile ? imgProfile: ""} alt="" />
                            </div>
                                <p className="li-mobile-p">Mi perfil</p>
                            </NavLink>
                        </div>
                        <div className="menu">
                            <div
                                onClick={cerrarSesion}
                                style={{ cursor: "pointer" }}
                                className="frame"
                            >
                                <i className="ri-logout-box-line"></i>
                                <p className="li-mobile-p">Salir</p>
                            </div>
                        </div>
                    </>
                )}
                {rol === "Cliente" && (
                    <>
                        <div className="menu">
                            <NavLink to="/inicio" className="frame">
                                <i className="ri-home-3-line"></i>
                                <p className="li-mobile-p">Inicio</p>
                            </NavLink>
                        </div>
                        <div className="menu">
                            <NavLink to="/historial" className="frame">
                                <i className="ri-history-line"></i>
                                <p className="li-mobile-p">
                                    Historial de citas
                                </p>
                            </NavLink>
                        </div>
                        <div className="contenedor-logos">
                            <img
                                className="logo1"
                                src={AppsLogo}
                                alt="Apps for the world Logo"
                            />
                        </div>
                        <div className="menu">
                            <NavLink to="/MiPerfil" className="frame">
                            <div className="imgNavbarProfile">
                              <img src={imgProfile ? imgProfile: ""} alt="" />
                            </div>
                                <p className="li-mobile-p">Mi perfil</p>
                            </NavLink>
                        </div>
                        <div className="menu">
                            <div
                                onClick={cerrarSesion}
                                style={{ cursor: "pointer" }}
                                className="frame"
                            >
                                <i className="ri-logout-box-line"></i>
                                <p className="li-mobile-p">Salir</p>
                            </div>
                        </div>
                    </>
                )}
                {rol === "Empresa" && (
                    <>
                        <div className="menu">
                            <NavLink to="/inicio" className="frame">
                                <i className="ri-home-3-line"></i>
                                <p className="li-mobile-p">Inicio</p>
                            </NavLink>
                        </div>
                        <div className="menu">
                            <NavLink to="/productospanel" className="frame">
                                <i className="ri-store-2-line"></i>
                                <p className="li-mobile-p">Ventas</p>
                            </NavLink>
                        </div>
                        <div className="menu">
                            <NavLink to="/empleadospanel" className="frame">
                                <i className="ri-calendar-event-line"></i>
                                <p className="li-mobile-p">Agenda</p>
                            </NavLink>
                        </div>
                        <div className="menu">
                            <NavLink to="/clientespanel" className="frame">
                                <i className="ri-group-line"></i>
                                <p className="li-mobile-p">Clientes</p>
                            </NavLink>
                        </div>
                        <div className="menu">
                            <NavLink to="/qrspanel" className="frame">
                                <i className="ri-qr-code-line"></i>
                                <p className="li-mobile-p">Qrs</p>
                            </NavLink>
                        </div>
                        <div className="menu">
                            <NavLink to="/estadisticapanel" className="frame">
                                <i className="ri-bar-chart-2-line"></i>
                                <p className="li-mobile-p">Estadistica</p>
                            </NavLink>
                        </div>
                        <div className="menu">
                            <NavLink to="/empresapanel" className="frame">
                                <i className="ri-building-4-line"></i>
                                <p className="li-mobile-p">Empresa</p>
                            </NavLink>
                        </div>
                        <div className="menu">
                            <NavLink to="/estado" className="frame">
                                <i className="ri-radio-button-line"></i>
                                <p className="li-mobile-p">Estado</p>
                            </NavLink>
                        </div>
                        <NavLink to="/MiPerfil" className="frame">
                            <i className="ri-user-line "></i>
                            <p className="li-mobile-p">Mi perfil</p>
                        </NavLink>
                        <div className="menu">
                            <div
                                onClick={cerrarSesion}
                                style={{ cursor: "pointer" }}
                                className="frame"
                            >
                                <i className="ri-logout-box-line"></i>
                                <p className="li-mobile-p">Salir</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div className="menu-5"></div>
            <Toaster />
        </div>
    );
}

export default NavbarMobile;