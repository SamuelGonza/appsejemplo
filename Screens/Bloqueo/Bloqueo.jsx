import { Helmet } from "react-helmet";
import "./Bloqueo.css";
import NavbarMobile from "../../Components/NavbarMobile/NavbarMobile";
import AppsLogo from "../../assets/LogoCompleto.png"
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useState } from "react";
const Url = import.meta.env.VITE_APP_BACKEND_URL;


export default function UsuariosBloqueado() {
    const [subscribeData, setSubscribeData] = useState(null);
    const [localData, setLocalData] = useState(null);
    const ids = JSON.parse(localStorage.getItem("ids"));
    const token = localStorage.getItem("token");

    useEffect(() => {
        traerDatosSubscripcion();
        traerDatosLocal();
    }, []);

    const traerDatosSubscripcion = async () => {
        if (!ids || !token) {
            toast.error("Identificadores o token no disponibles.");
            return;
        }

        toast.remove();
        try {
            const response = await fetch(
                `${Url}/Admin/subscripcion/${ids.idEmpresa}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Tenemos problemas");
            }
            const data = await response.json();
            setSubscribeData(data);
        } catch (error) {
            console.error("Error in traerDatosSubscripcion:", error);
            toast.error(error.message);
        }
    };

    const traerDatosLocal = async () => {
        if (!ids || !token) {
            toast.error("Identificadores o token no disponibles.");
            return;
        }

        toast.remove();
        try {
            const response = await fetch(
                `${Url}/local/infoIngreso/${ids.idLocal}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Tenemos problemas");
            }
            const data = await response.json();
            setLocalData(data);
        } catch (error) {
            console.error("Error in traerDatosLocal:", error);
            toast.error(error.message);
        }
    };

    return (
        <>
            <NavbarMobile />
            <Helmet title="Has sido bloqueado"/>
            <div className="bloqueo-container">
                <div className="bloqueo-box">
                    <h1 className="bloqueo-title">
                        Tu cuenta ha sido bloqueada
                    </h1>
                    {localData && localData.localImg && (
                        <div className="logosContainer">
                            <img className="appsLogo" src={AppsLogo} alt="Logo Apps for the World" />
                            <img className="localImg" src={localData.localImg} alt="Imagen Local" />
                        </div>
                    )}
                    <p className="bloqueo-text">
                        Lamentamos informarte que tu cuenta ha sido bloqueada
                        debido a la falta de asistencia o cancelación de una
                        cita. Este comportamiento resulta en un strike, y al
                        acumular tres strikes, se procede al bloqueo de tu
                        cuenta.
                        </p> 
                    {subscribeData && subscribeData.correo && (
                        <p className="bloqueo-text">
                        Puedes reactivar tu cuenta comunicandote con el administrador a traves de <a href={`mailto:${subscribeData.correo}`}>{subscribeData.correo}</a> o llamado a <a href={`phone:${localData.telefono}`}>{localData.telefono}</a>
                        </p>
                    )}
                </div>
            </div>
            <Toaster />
        </>
    );
}