import { Helmet } from "react-helmet";
import NavbarMobile from "../../Components/NavbarMobile/NavbarMobile";
import AppsLogo from "../../assets/LogoCompleto.png"
import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useState } from "react";
const Url = import.meta.env.VITE_APP_BACKEND_URL;

export default function NoActivo() {
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
            <Helmet title="Cuenta inactiva - Apps for the World" />
            <div className="bloqueo-container">
                <div className="bloqueo-box">
                    <h1 className="bloqueo-title">
                        Tu cuenta está inactiva
                    </h1>
                    {localData && localData.localImg && (
                        <div className="logosContainer">
                            <img className="appsLogo" src={AppsLogo} alt="Logo Apps for the World" />
                            <img className="localImg" src={localData.localImg} alt="Imagen Local" />
                        </div>
                    )}
                    {subscribeData && subscribeData.correo && (
                        <p className="bloqueo-text">
                            Para acceder a los servicios de este establecimiento, es necesario activar tu cuenta. Esta verificación adicional se realiza como medida de seguridad. Puedes activar tu cuenta comunicandote con el administrador a traves de <a href={`mailto:${subscribeData.correo}`}>{subscribeData.correo}</a> o llamado a <a href={`phone:${localData.telefono}`}>{localData.telefono}</a>
                        </p>
                    )}
                    <p className="bloqueo-text">
                        Si crees que se trata de un error, puedes ponerte en contacto con nosotros enviando un correo a <a href="mailto:desarrollo@tecnotics.com">desarrollo@tecnotics.com</a>.
                    </p>
                </div>
            </div>
            <Toaster />
        </>
    );
}