import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import moment from 'moment';

export default function NormalUsersMiddleware({ children }) {
    const [decodedPayload, setDecodedPayload] = useState(null);
    const [rol, setRol] = useState("");
    const [ids, setIds] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const rol = localStorage.getItem("rol");
        const ids = JSON.parse(localStorage.getItem("ids"));

        if (!token || !rol) {
            navigate("/");
            return;
        }
        try {
            const decodedPayload = JSON.parse(atob(token.split(".")[1]));
            setDecodedPayload(decodedPayload);
            setRol(rol);
            setIds(ids)
        } catch (error) {
            navigate("/");
        }
    }, [navigate]);

    useEffect(() => {
        if (decodedPayload) {
            const tiempoActual = moment().unix();
            const tiempoActualFormat = moment().format("DD/MM/YYYY");
            if (tiempoActual >= decodedPayload.exp) {

                
                const ruta = rol === "Empresa" ? "empresa": rol === "AdminLocal" ? "local": rol === "Trabajador" ? "trabajador": "cliente"
                const idRuta = rol === "Empresa" ? ids.idEmpresa: ids.idLocal

                navigate(`/login/${ruta}/${idRuta}`);
                return;
            }

            if(tiempoActualFormat === moment(decodedPayload.fechaVencimiento).format("DD/MM/YYYY")){
                navigate(`/estado`);
                return;
            }

            if (decodedPayload.estado === false) {
                navigate("/estado");
            } else if (decodedPayload.strikes >= 3) {
                navigate("/suspendido");
            } else if (decodedPayload.cuentaActiva === false) {
                navigate("/noactiva");
            } else if (
                rol !== "SuperAdmin" &&
                rol !== "Empresa" &&
                rol !== "AdminLocal" &&
                rol !== "Trabajador" &&
                rol !== "Cliente"
            ) {
                navigate("/");
            }
        }
    }, [decodedPayload, navigate, rol]);

    return children ? children : <Outlet />;
}