import { useEffect, useState } from "react";
import AspectRatio from "@mui/joy/AspectRatio";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import "./Trabajadores.css";
import toast, { Toaster } from "react-hot-toast";
import generateICSFile from "../../functions/generarICS";
import HourglassBottomOutlinedIcon from "@mui/icons-material/HourglassBottomOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import moment from "moment";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ModeEditOutlineOutlinedIcon from "@mui/icons-material/ModeEditOutlineOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/es";
dayjs.locale("es");

dayjs.extend(updateLocale);

dayjs.updateLocale("es", {
    weekStart: 0,
});

const Url = import.meta.env.VITE_APP_BACKEND_URL;

import io from "socket.io-client";
import {
    Checkbox,
    Grid,
    MenuItem,
    Skeleton,
    TextField,
    Tooltip,
} from "@mui/material";
import ConfirmarCitas from "../Modales/ConfirmarCitas";
import { NavLink } from "react-router-dom";
import FinalizarCitasModal from "../Modales/FinalizarCitas";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DoNotDisturb } from "@mui/icons-material";
const socket = io(Url);

export default function Trabajadores({
    trabajadores,
    numeroRol,
    cargando,
    mostrarModal,
    modalEstado,
    mostrarModalHorario,
    modalHorarioEstado,
    enviarModoEdicion,
    modoEdicionEstado,
    trabajadoresFunc,
    idLocalUsar,
}) {
    const ids = JSON.parse(localStorage.getItem("ids"));
    const [trabajadorSeleccionado, setTrabajadorSeleccionado] = useState("");
    const [fechaActual, setFechaActual] = useState("");
    const [fechaDividida, setFechaDividida] = useState("");
    const [servicios, setServicios] = useState([]);
    const [openCancelar, setOpenCancelar] = useState(false);
    const [openConfirmar, setOpenConfirmar] = useState(false);
    const [asignarCitaModal, setAsignarCitaModal] = useState(false);
    const [reservaData, setReservaData] = useState({});
    const [servicioSeleccionado, setServicioSeleccionado] = useState("");
    const [servicioId, setServicioId] = useState("");
    const [agendaId, setAgendaid] = useState("");
    const [horarioId, setHorarioId] = useState("");
    const [hora, setHora] = useState("");
    const [filtroTrabajador, setFiltroTrabajador] = useState("");
    const [todosLosHorarios, setTodosLosHorarios] = useState([]);
    const [todosLosClientes, setTodosLosClientes] = useState([]);
    const [trabajadorId, setTrabajadorId] = useState("");
    const [filtroHorarios, setFiltroHorarios] = useState("disponible");
    const [quien, setQuien] = useState("Cliente");
    const [forceUpdate, setForceUpdate] = useState(0);
    const [citasSeleccionadas, setCitasSeleccionadas] = useState([]);
    const [modoEdicion, setModoEdicion] = useState(false);
    let [duracion, setDuracion] = useState(0);
    let [ultimoIndex, setUltimoIndex] = useState(0);
    const [indicesCitas, setIndicesCitas] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(
        ids.clienteGeneral
    );
    const [inputValue, setInputValue] = useState("");
    const [confirmarCitas, setConfirmarCitas] = useState({});
    const [finalizarCitas, setFinalizarCitas] = useState({});
    const [diasDescanso, setDiasDescanso] = useState({});
    const [fechaSeleccionada, setFechaSeleccionada] = useState(
        dayjs().format("YYYY-MM-DD")
    );

    const [calendarioVisible, setCalendarioVisible] = useState(false);

    const error = (mensaje) => toast.error(mensaje);
    const exito = (mensaje) => toast.success(mensaje);
    const cargandoFetch = (mensaje) => toast.loading(mensaje);

    const rol = localStorage.getItem("rol");
    const token = localStorage.getItem("token");

    const generarNumeroAleatorio = () =>
        Math.floor(Math.random() * (1301 - 300)) + 300;

    const recargarDatos = async () => {
        await traerHorariosDeTodos();
        await traerServicios();
    };

    const recargarTrabajadores = async () => {
        await trabajadoresFunc();
    };

    const generarCita = async () => {
        cargandoFetch("Generando cita...");
        const tiempoGenerado = generarNumeroAleatorio();
        setTodosLosHorarios([]);
        try {
            setTimeout(async () => {
                const response = await fetch(
                    `${Url}/cliente/agenda/${
                        quien === "Cliente"
                            ? ids.idCliente
                            : clienteSeleccionado
                    }`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            authorization: token,
                        },
                        body: JSON.stringify(reservaData),
                    }
                );

                if (response.ok) {
                    toast.dismiss();
                    exito(
                        "Se ha enviado la confirmacion de la cita a tu correo"
                    );
                    enviarCorreo("agendada");
                } else {
                    toast.dismiss();
                    recargarDatos();
                    error("Ya fue tomada por otro usuario");
                }
            }, tiempoGenerado);
        } catch (err) {
            console.log(err);
        }
    };

    const traerClientes = async () => {
        try {
            const response = await fetch(
                `${Url}/Admin/clientes/${
                    ids.idLocal ? ids.idLocal : idLocalUsar
                }`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: token,
                    },
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    error("No hay clientes para seleccionar");
                } else if (response.status === 500) {
                    error("Tenemos problemas al obtener los clientes");
                } else {
                    throw new Error("Tenemos problemas");
                }
            } else {
                const data = await response.json();
                setTodosLosClientes(data);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleOpenCancelar = (agendId, horarioId, id) => {
        setOpenCancelar(true);
        setAgendaid(agendId);
        setHorarioId(horarioId);
        setTrabajadorId(id);
    };

    const handleCloseCancelar = () => {
        setTrabajadorId("");
        setOpenCancelar(false);
    };

    const confirmarCancelarCita = async () => {
        setOpenCancelar(false);
        await cancelarCita();
        exito("Se ha cancelado la cita");
    };

    const buscarHorario = async () => {
        let horariosEncontrados = [];

        for (let idTrabajador in todosLosHorarios) {
            let horariosTrabajador = todosLosHorarios[idTrabajador];

            for (let i = 0; i < horariosTrabajador.length; i++) {
                let horarioLista = horariosTrabajador[i];

                if (horarioLista.idCliente === ids.idCliente) {
                    horariosEncontrados.push(horarioLista);
                    break;
                }
            }
        }

        return horariosEncontrados;
    };

    const handleAsignarCita = async () => {
        setQuien("AdminLocal");
        await traerClientes();
        setAsignarCitaModal(true);
    };
    const handleConfirmarAsignarCita = async () => {
        await generarCita();
        setAsignarCitaModal(false);
    };
    const handleCancelarAsignarCita = () => {
        setAsignarCitaModal(false);
    };

    const handleConfirmaCita = async () => {
        await generarCita();
        setOpenConfirmar(false);
    };
    const handleCancelarConfirmaCita = () => {
        setOpenConfirmar(false);
    };

    const fusionarYagendarCita = async () => {
        cargandoFetch("Fusionando citas...");
        try {
            const response = fetch(
                `${Url}/cliente/fusion/${ids.clienteGeneral}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: token,
                    },
                    body: JSON.stringify({ citaData: citasSeleccionadas }),
                }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    alert("No encontramos este horario");
                } else if (response.status === 490) {
                    alert(
                        "No podemos fusionar estas citas porque ya fuermon tomadas por un cliente"
                    );
                } else {
                    toast.dismiss();
                    setModoEdicion(false);
                    enviarModoEdicion(!modoEdicionEstado);
                    setCitasSeleccionadas([]);
                    setDuracion(0);
                    alert("Se ha fusionado la cita correctamente");
                }
            } else {
                throw new Error("Tenemos problemas");
            }
        } catch (err) {
            console.log(err);
        }
    };

    const traerAjustes = async () => {
        try {
            const response = await fetch(
                `${Url}/local/ajustes/${
                    ids.idLocal ? ids.idLocal : idLocalUsar
                }`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: localStorage.getItem("token"),
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Tenemos un problema al traer los ajustes");
            } else {
                const data = await response.json();
                setConfirmarCitas(data.ajustes.confirmarCitas);
                setFinalizarCitas(data.ajustes.finalizarCitaAdmin);
                setDiasDescanso(data.ajustes.diasDescanso);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const confirmarCita = async (trabajadorId, horario, id, quien) => {
        try {
            let horariosEncontrados = [];
            if (quien === "Cliente") {
                horariosEncontrados = await buscarHorario();
            } else if (quien === "AdminLocal") {
                horariosEncontrados = [];
            }
            const response = await fetch(
                `${Url}/Admin/horario/${horario._id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: token,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Hubo un error");
            } else {
                const data = await response.json();

                if (data.tomada) {
                    error("Esta cita ya fue tomada por otro cliente");
                    return recargarDatos();
                } else {
                    if (horariosEncontrados.length === 0) {
                        if (quien === "Cliente") {
                            setOpenConfirmar(true);
                        } else {
                            handleAsignarCita();
                            setAsignarCitaModal(true);
                        }
                        const { _id, hora, fecha } = horario;
                        setHora(hora);
                        setTrabajadorId(id);
                        setHorarioId(_id);

                        const fechaTimestamp = moment(
                            fecha,
                            "MM/DD/YYYY"
                        ).toDate();

                        const formattedDate = fechaTimestamp.toLocaleDateString(
                            "es-ES",
                            {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                            }
                        );

                        setFechaActual(formattedDate);

                        const optionsDayOfWeek = { weekday: "long" };
                        const optionsDayOfMonth = { day: "numeric" };
                        const optionsMonth = { month: "long" };

                        const dayOfWeek = fechaTimestamp.toLocaleDateString(
                            "es-ES",
                            optionsDayOfWeek
                        );
                        const dayOfMonth = fechaTimestamp.toLocaleDateString(
                            "es-ES",
                            optionsDayOfMonth
                        );
                        const month = fechaTimestamp.toLocaleDateString(
                            "es-ES",
                            optionsMonth
                        );

                        setFechaDividida({ dayOfWeek, dayOfMonth, month });

                        const citaData = {
                            dia: dayOfWeek,
                            diaNumero: dayOfMonth,
                            mes: fechaDividida.month,
                            fechaCompleta: formattedDate,
                            hora: _id,
                            servicio: servicioSeleccionado,
                            detallesServicio: "Se define en persona",
                            idTrabajador: trabajadorId,
                            idEmpresa: ids.idEmpresa,
                            idLocal: ids.idLocal ? ids.idLocal : idLocalUsar,
                            porModal: false,
                            servicioId,
                            confirmada: confirmarCitas === true ? false : true,
                            fechaStamp: fechaTimestamp,
                        };

                        setReservaData(citaData);
                    } else {
                        error("No puedes agendar más de una cita a la vez");
                    }
                }
            }
        } catch (err) {
            console.log(err.message);
        }
    };

    const establecerModal = (id) => {
        mostrarModal(id, !modalEstado);
    };

    const establecerModalHorario = (id) => {
        mostrarModalHorario(id, !modalHorarioEstado);
    };

    const traerHorario = async (idTrabajador) => {
        setTodosLosHorarios([]);
        try {
            setTimeout(async () => {
                const response = await fetch(
                    `${Url}/cliente/horarios/${idTrabajador}/${ids.idCliente}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            authorization: token,
                        },
                    }
                );

                if (!response.ok) {
                    if (response.status === 404) {
                        return;
                    } else {
                        throw new Error("Error al conseguir esta informacion");
                    }
                } else {
                    const data = await response.json();
                    setTodosLosHorarios((prevHorarios) => ({
                        ...prevHorarios,
                        [idTrabajador]: data,
                    }));
                }
            }, 600);
        } catch (err) {
            console.log(err);
        }
    };

    const traerHorarioLocal = async (idTrabajador) => {
        setTodosLosHorarios([]);
        try {
            setTimeout(async () => {
                const response = await fetch(
                    `${Url}/local/horarios/${idTrabajador}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            authorization: token,
                        },
                    }
                );

                if (!response.ok) {
                    if (response.status === 404) {
                        return;
                    } else {
                        throw new Error("Error al conseguir esta informacion");
                    }
                } else {
                    const data = await response.json();
                    setTodosLosHorarios((prevHorarios) => ({
                        ...prevHorarios,
                        [idTrabajador]: data,
                    }));
                }
            }, 600);
        } catch (err) {
            console.log(err);
        }
    };

    const traerServicios = async () => {
        try {
            const response = await fetch(
                `${Url}/cliente/productos/${
                    ids.idLocal ? ids.idLocal : idLocalUsar
                }/servicios`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        authorization: token,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("No se pudo traer los servicios");
            } else {
                const data = await response.json();
                setServicios(data);
                setServicioSeleccionado(data[0].nombreProducto);
                setServicioId(data[0]._id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const cancelarCita = async () => {
        try {
            const response = await fetch(`${Url}/cliente/agenda/${agendaId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    authorization: token,
                },
                body: JSON.stringify({ idHorario: horarioId }),
            });

            if (response.ok) {
                enviarCorreo("cancelada");
            } else {
                error("No se pudo eliminar la cita");
            }
        } catch (err) {
            console.log(err);
        }
    };

    const enviarCorreo = async (estado) => {
        let data = {
            idCliente: quien === "Cliente" ? ids.idCliente : ids.clienteGeneral,
            idTrabajador: trabajadorId,
            estado,
            hora,
            fecha: fechaActual,
            horaId: horarioId,
            porModal: false,
        };
        if (estado === "agendada") {
            const icsContent = generateICSFile(fechaActual, hora);
            data = { ...data, archivoICS: icsContent };
        }
        try {
            const response = await fetch(`${Url}/user/citaNotificacion`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error("No se pudo enviar el correo");
            } else {
                return;
            }
        } catch (err) {
            console.log(err);
        }
    };

    const traerHorariosDeTodos = async () => {
        try {
            const promises = trabajadores.map((trabajador) => {
                if (rol === "Cliente") {
                    return traerHorario(trabajador._id);
                } else {
                    return traerHorarioLocal(trabajador._id);
                }
            });

            await Promise.all(promises);
        } catch (err) {
            console.log("Error:", err);
        }
    };

    useEffect(() => {
        const loadDefaultData = async () => {
            const selectedDate = new Date();

            const formattedDate = selectedDate.toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
            });

            setFechaActual(formattedDate);

            if (rol === "Cliente") {
                await traerHorariosDeTodos();
                await traerServicios();
            }
            if (rol === "AdminLocal") {
                await traerHorariosDeTodos();
                await traerServicios();
            }
            if (rol === "Empresa") {
                await traerHorariosDeTodos();
                await traerServicios();
            }

            if (!trabajadorSeleccionado && trabajadores.length > 0) {
                setTrabajadorSeleccionado(trabajadores[0]._id);
            }

            const optionsDayOfWeek = { weekday: "long" };
            const optionsDayOfMonth = { day: "numeric" };
            const optionsMonth = { month: "long" };

            const dayOfWeek = selectedDate.toLocaleDateString(
                "es-ES",
                optionsDayOfWeek
            );
            const dayOfMonth = selectedDate.toLocaleDateString(
                "es-ES",
                optionsDayOfMonth
            );
            const month = selectedDate.toLocaleDateString(
                "es-ES",
                optionsMonth
            );

            setFechaDividida({ dayOfWeek, dayOfMonth, month });
        };

        loadDefaultData();
    }, [rol, trabajadorSeleccionado, trabajadores]);

    useEffect(() => {
        socket.on("citaNotificada", async () => {
            setForceUpdate((prevState) => prevState + 1);
        });

        return () => {
            socket.off("citaNotificada");
        };
    }, []);

    useEffect(() => {
        recargarDatos();
    }, [forceUpdate]);

    const trabajadoresFiltrados = filtroTrabajador
        ? trabajadores.filter(
              (trabajador) => trabajador._id === filtroTrabajador
          )
        : trabajadores;

    const horariosFiltrados = [];

    trabajadoresFiltrados.forEach((trabajador) => {
        const horarios = todosLosHorarios[trabajador._id] || [];
        const horariosFiltradosPorDisponibilidad = horarios.filter(
            (horario) => {
                if (filtroHorarios === "todos") {
                    return true;
                } else if (filtroHorarios === "disponible") {
                    return !horario.tomada;
                } else if (filtroHorarios === "ocupados") {
                    return horario.tomada;
                } else if (filtroHorarios === "proceso") {
                    return horario.activa;
                }
            }
        );

        horariosFiltrados.push({
            trabajador,
            horarios: horariosFiltradosPorDisponibilidad,
        });
    });

    const abrirModoEdicion = () => {
        setModoEdicion(true);
        enviarModoEdicion(!modoEdicionEstado);
        setFiltroHorarios("disponible");
    };
    const cancelarModoEdicion = () => {
        setModoEdicion(false);
        enviarModoEdicion(!modoEdicionEstado);
        setCitasSeleccionadas([]);
        setDuracion(0);
        setUltimoIndex(0);
    };

    useEffect(() => {
        return;
    }, [citasSeleccionadas]);

    useEffect(() => {
        if (modoEdicion) {
            document.body.style = "background-color: rgba(0, 0, 0, 0.241);";
        } else {
            document.body.style = "background-color: white";
        }
    }, [modoEdicion]);

    const agregarCita = (horarioId, empleadoId, hora, index) => {
        if (citasSeleccionadas.length < 3) {
            const existeCitaConEmpleadoDiferente = citasSeleccionadas.some(
                (cita) => cita.empleadoId !== empleadoId
            );
            const existeCitaConMismoHorario = citasSeleccionadas.some(
                (cita) => cita.horarioId === horarioId
            );

            if (!existeCitaConEmpleadoDiferente && !existeCitaConMismoHorario) {
                if (
                    ultimoIndex === -1 ||
                    index === ultimoIndex + 1 ||
                    citasSeleccionadas.length === 0
                ) {
                    const nuevaCita = {
                        horarioId,
                        empleadoId,
                        hora,
                        servicio: servicioSeleccionado,
                    };

                    const nuevasCitas = [...citasSeleccionadas, nuevaCita];
                    nuevasCitas.sort((citaA, citaB) => {
                        return moment(`01/01/2022 ${citaA.hora}`).diff(
                            moment(`01/01/2022 ${citaB.hora}`)
                        );
                    });

                    const primeraHora = moment(
                        `01/01/2022 ${nuevasCitas[0].hora}`
                    );
                    const ultimaHora = moment(
                        `01/01/2022 ${nuevasCitas[nuevasCitas.length - 1].hora}`
                    );
                    const diferenciaMinutos = ultimaHora.diff(
                        primeraHora,
                        "minutes"
                    );

                    setDuracion(diferenciaMinutos);
                    setCitasSeleccionadas(nuevasCitas);
                    setUltimoIndex(index);
                    setIndicesCitas((prevIndices) => [...prevIndices, index]);
                } else {
                    error("Solo puedes seleccionar horas continuas");
                }
            } else {
                error(
                    "No puedes unir citas de diferentes asesores o agregar la misma cita"
                );
            }
        } else {
            error("No puedes unir más de 3 citas");
        }
    };

    const activarDesactivarTrabajador = async (idTrabajador, estado) => {
        try {
            const response = await fetch(
                `${Url}/Admin/trabajador/${idTrabajador}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: token,
                    },
                    body: JSON.stringify({ estado }),
                }
            );

            if (!response.ok) {
                throw new Error(
                    `No pudimos ${
                        estado ? "activar" : "desactivar"
                    } a este empleado`
                );
            } else {
                alert("Estado del empleado cambiado correctamente");
                recargarTrabajadores();
            }
        } catch (err) {
            alert(err);
        }
    };

    const mostrarMensajeDescanso =
        diasDescanso.activo &&
        ((diasDescanso.cuando === 1 &&
            (moment().day() === 0 || moment().day() === 6)) ||
            (diasDescanso.cuando === 2 && moment().day() === 6) ||
            (diasDescanso.cuando === 3 && moment().day() === 0));

    useEffect(() => {
        traerAjustes();
    }, []);

    return (
        <div
            className="trabajadoresContainer"
            onClick={() =>
                calendarioVisible && setCalendarioVisible(!calendarioVisible)
            }
        >
            {rol === "AdminLocal" && (
                <div className="modoEdicionBtn">
                    {modoEdicion === false && (
                        <Tooltip
                            title="Combina horarios para crear citas mas extensas"
                            placement="right"
                        >
                            <button onClick={() => abrirModoEdicion()}>
                                <EditCalendarOutlinedIcon />
                            </button>
                        </Tooltip>
                    )}
                    {modoEdicion && (
                        <Tooltip title="Finalizar y combinar" placement="right">
                            <button onClick={() => fusionarYagendarCita()}>
                                <CheckCircleOutlineOutlinedIcon />
                            </button>
                        </Tooltip>
                    )}
                    {modoEdicion && (
                        <Tooltip
                            title="Cancelar el modo edición"
                            placement="right"
                        >
                            <button onClick={() => cancelarModoEdicion()}>
                                <CloseOutlinedIcon />
                            </button>
                        </Tooltip>
                    )}
                </div>
            )}
            {modoEdicion && (
                <div className="alertaModoEdicion">
                    <h2>Extender horario</h2>
                    <p style={{ textAlign: "center" }}>
                        Tienes la capacidad de fusionar horarios para crear
                        citas más extensas. Puedes seleccionar hasta tres
                        horarios para generar una cita única. Una vez
                        seleccionadas, preciona finalizar abajo a la derecha
                    </p>
                    <div className="citasUnidas">
                        {citasSeleccionadas.map((cita, index) => (
                            <h3 key={index}>
                                {cita.hora} {"=>"}
                            </h3>
                        ))}
                        <h3 style={{ marginLeft: "5px" }}>
                            {citasSeleccionadas.length === 0
                                ? "Selecciona un horario primero"
                                : `${duracion} minutos`}
                        </h3>
                    </div>
                </div>
            )}
            {rol === "AdminLocal" && modoEdicion === false && (
                <>
                    {confirmarCitas && <ConfirmarCitas quien="AdminLocal" />}
                    {finalizarCitas && (
                        <FinalizarCitasModal
                            margen={confirmarCitas ? "66px" : "0px"}
                        />
                    )}
                </>
            )}
            {(rol === "Cliente" || rol === "AdminLocal") &&
                !mostrarMensajeDescanso && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: "20px",
                            
                        }}
                    >
                        <div
                            className="filtrosContainer"
                            style={{ display: "flex", gap: "15px" }}
                        >
                            <div
                                className="filtroGrupo"
                            >
                                <div style={{ marginBottom: "10px" }}>
                                    <label
                                        htmlFor="trabajador-select"
                                        style={{
                                            textAlign: "center",
                                            marginBottom: "5px",
                                        }}
                                    >
                                        Filtrar asesor
                                    </label>
                                </div>
                                <div>
                                    <TextField
                                        select
                                        id="trabajador-select"
                                        value={filtroTrabajador}
                                        label="Selecciona un trabajador"
                                        style={{
                                            width: "170px",
                                            height: "40px",
                                            marginBottom: "10px",
                                            cursor: "pointer",
                                            borderRadius: "8px",
                                            paddingLeft: "7px",
                                        }}
                                        onChange={(event) =>
                                            setFiltroTrabajador(
                                                event.target.value
                                            )
                                        }
                                    >
                                        <MenuItem value="">
                                            Todos los asesores
                                        </MenuItem>
                                        {trabajadores.map((trabajador) =>
                                            rol === "Cliente" ? (
                                                trabajador.estado && (
                                                    <MenuItem
                                                        key={trabajador._id}
                                                        value={trabajador._id}
                                                    >
                                                        {trabajador.nombre}
                                                    </MenuItem>
                                                )
                                            ) : (
                                                <MenuItem
                                                    key={trabajador._id}
                                                    value={trabajador._id}
                                                >
                                                    {trabajador.nombre}
                                                </MenuItem>
                                            )
                                        )}
                                    </TextField>
                                </div>
                            </div>
                            {rol === "Cliente" ? (
                                <div className="filtroGrupo">
                                    <div style={{ marginBottom: "10px" }}>
                                        <label
                                            htmlFor="trabajador-select"
                                            style={{
                                                textAlign: "center",
                                                marginBottom: "5px",
                                            }}
                                        >
                                            Filtrar las citas
                                        </label>
                                    </div>
                                    <div>
                                        <TextField
                                            select
                                            style={{
                                                width: "170px",
                                                height: "40px",
                                                marginBottom: "10px",
                                                cursor: "pointer",
                                                borderRadius: "8px",
                                                paddingLeft: "7px",
                                            }}
                                            id="disponibilidad-select"
                                            value={filtroHorarios}
                                            label="Selecciona una disponibilidad"
                                            onChange={(event) =>
                                                setFiltroHorarios(
                                                    event.target.value
                                                )
                                            }
                                            SelectProps={{
                                                renderValue: (value) => (
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            textTransform: "capitalize"
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                width: "10px",
                                                                height: "10px",
                                                                borderRadius:
                                                                    "50%",
                                                                backgroundColor:
                                                                    value ===
                                                                    "disponible"
                                                                        ? "green"
                                                                        : value ===
                                                                          "ocupados"
                                                                        ? "red"
                                                                        : value ===
                                                                          "proceso"
                                                                        ? "orange"
                                                                        : "gray",
                                                                marginRight:
                                                                    "5px",
                                                            }}
                                                        ></span>
                                                        {value}
                                                    </div>
                                                ),
                                            }}
                                        >
                                            <MenuItem value="disponible">
                                                Disponibles
                                            </MenuItem>
                                            <MenuItem value="ocupados">
                                                Ocupados
                                            </MenuItem>
                                            <MenuItem value="proceso">
                                                En proceso
                                            </MenuItem>
                                            <MenuItem value="todos">
                                                Todos los horarios
                                            </MenuItem>
                                        </TextField>
                                    </div>
                                </div>
                            ) : (
                                rol === "AdminLocal" &&
                                modoEdicion === false && (
                                    <div className="filtroGrupo">
                                        <div style={{ marginBottom: "10px" }}>
                                            <label
                                                htmlFor="trabajador-select"
                                                style={{
                                                    textAlign: "center",
                                                    marginBottom: "5px",
                                                }}
                                            >
                                                Filtrar las citas
                                            </label>
                                        </div>
                                        <div>
                                            <TextField
                                                select
                                                style={{
                                                    width: "170px",
                                                    height: "40px",
                                                    marginBottom: "10px",
                                                    cursor: "pointer",
                                                    borderRadius: "8px",
                                                    paddingLeft: "7px",
                                                }}
                                                id="disponibilidad-select"
                                                value={filtroHorarios}
                                                label="Selecciona una disponibilidad"
                                                onChange={(event) =>
                                                    setFiltroHorarios(
                                                        event.target.value
                                                    )
                                                }
                                                SelectProps={{
                                                    renderValue: (value) => (
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                textTransform: "capitalize"
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    width: "10px",
                                                                    height: "10px",
                                                                    borderRadius:
                                                                        "50%",
                                                                    backgroundColor:
                                                                        value ===
                                                                        "disponible"
                                                                            ? "green"
                                                                            : value ===
                                                                              "ocupados"
                                                                            ? "red"
                                                                            : value ===
                                                                              "proceso"
                                                                            ? "orange"
                                                                            : "gray",
                                                                    marginRight:
                                                                        "5px",
                                                                }}
                                                            ></span>
                                                            {value}
                                                        </div>
                                                    ),
                                                }}
                                            >
                                                <MenuItem value="disponible">
                                                    Disponibles
                                                </MenuItem>
                                                <MenuItem value="ocupados">
                                                    Ocupados
                                                </MenuItem>
                                                <MenuItem value="proceso">
                                                    En proceso
                                                </MenuItem>
                                                <MenuItem value="todos">
                                                    Todos los horarios
                                                </MenuItem>
                                            </TextField>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}

            <div className="tarjetasContainer">
                {cargando ? (
                    <>
                        <Skeleton variant="rounded" width={300} height={380} />
                        <Skeleton variant="rounded" width={300} height={380} />
                        <Skeleton variant="rounded" width={300} height={380} />
                    </>
                ) : (
                    horariosFiltrados
                        .filter(
                            ({ trabajador }) =>
                                !(
                                    rol === "Cliente" &&
                                    trabajador.estado === false
                                )
                        )
                        .map(({ trabajador, horarios }) => (
                            <Box
                                key={trabajador._id}
                                className="tarjetaContainer centrada"
                                sx={{
                                    width: "350px",
                                    position: "relative",
                                }}
                            >
                                <Box />
                                {rol === "AdminLocal" && (
                                    <Tooltip
                                        title="Activar/Desactivar trabajador"
                                        arrow
                                    >
                                        <Checkbox
                                            checked={trabajador.estado}
                                            onChange={() =>
                                                activarDesactivarTrabajador(
                                                    trabajador._id,
                                                    !trabajador.estado
                                                )
                                            }
                                            className="activarTrabajador"
                                        />
                                    </Tooltip>
                                )}
                                <Card
                                    orientation="horizontal"
                                    sx={{
                                        width: "100%",
                                        flexWrap: "wrap",
                                        [`& > *`]: {
                                            "--stack-point": "500px",
                                            minWidth:
                                                "clamp(0px, (calc(var(--stack-point) - 2 * var(--Card-padding) - 2 * var(--variant-borderWidth, 0px)) + 1px - 100%) * 999, 100%)",
                                        },
                                        overflow: "auto",
                                        resize: "none",
                                        borderRadius: "20px",
                                    }}
                                >
                                    <AspectRatio
                                        flex
                                        ratio="1"
                                        maxHeight={182}
                                        sx={{ minWidth: 182 }}
                                    >
                                        <img
                                            src={trabajador.imgTrabajador}
                                            loading="lazy"
                                            alt=""
                                        />
                                    </AspectRatio>
                                    <CardContent>
                                        <Typography
                                            textAlign={"center"}
                                            fontSize="xl"
                                            fontWeight="lg"
                                        >
                                            {trabajador.nombre}
                                        </Typography>
                                        {numeroRol === 1 ? (
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: 1.5,
                                                    "& > button": { flex: 1 },
                                                }}
                                            >
                                                <Button
                                                    disabled={
                                                        modoEdicion
                                                            ? true
                                                            : false
                                                    }
                                                    onClick={() =>
                                                        establecerModal(
                                                            trabajador._id
                                                        )
                                                    }
                                                    variant="outlined"
                                                    color="neutral"
                                                >
                                                    <ModeEditOutlineOutlinedIcon />
                                                </Button>
                                                <Button
                                                    disabled={
                                                        modoEdicion
                                                            ? true
                                                            : false
                                                    }
                                                    onClick={() =>
                                                        establecerModalHorario(
                                                            trabajador._id
                                                        )
                                                    }
                                                    variant="solid"
                                                    color="primary"
                                                >
                                                    Establecer horarios
                                                </Button>
                                                {modoEdicion !== true && (
                                                    <NavLink
                                                        to={`/miHorario/${trabajador._id}`}
                                                        variant="solid"
                                                        style={{
                                                            width: "120px",
                                                            borderRadius: "8px",
                                                            fontSize: ".9em",
                                                            textAlign: "center",
                                                            fontWeight: "bold",
                                                            backgroundColor:
                                                                "#0b6bcb",
                                                            display: "flex",
                                                            justifyContent:
                                                                "center",
                                                            alignItems:
                                                                "center",
                                                            color: "white",
                                                            textDecoration:
                                                                "none",
                                                        }}
                                                        color="primary"
                                                    >
                                                        Bloquear Horarios
                                                    </NavLink>
                                                )}
                                            </Box>
                                        ) : (
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: 1.5,
                                                    "& > button": { flex: 1 },
                                                }}
                                            ></Box>
                                        )}
                                    </CardContent>
                                </Card>
                                {rol === "Cliente" ? (
                                    (mostrarMensajeDescanso || (trabajador.diasDescanso.activo && trabajador.diasDescanso.cuando === dayjs().day())) ? (
                                        <h2
                                            style={{
                                                width: "100%",
                                                textAlign: "center",
                                                marginTop: "20px",
                                            }}
                                        >
                                            {(trabajador.diasDescanso.activo && trabajador.diasDescanso.cuando === dayjs().day()) ? "Este asesor esta descansado vuelve ": "Estamos descansando, vuelve "}
                                        {diasDescanso.cuando === 1
                                            ? "el lunes"
                                            : "mañana"}
                                        </h2>
                                    ) : (
                                        <div className="clienteCita">
                                            {horarios.length > 0 ? (
                                                <div className="filtroGrupo">
                                                    <label
                                                        htmlFor="fecha-select"
                                                        style={{
                                                            textAlign: "center",
                                                            marginBottom:
                                                                "10px",
                                                        }}
                                                    >
                                                        Filtrar por fecha
                                                        disponible
                                                    </label>
                                                    <Grid container spacing={1}>
                                                        <Grid
                                                            item
                                                            xs={12}
                                                            sm={9}
                                                        >
                                                            <TextField
    select
    fullWidth
    sx={{
        padding: "0px !important",
        margin: "0px !important",
    }}
    variant="outlined"
    id="fecha-select"
    value={fechaSeleccionada || ""}
    onChange={(event) => setFechaSeleccionada(event.target.value)}
>
    <MenuItem value={dayjs().format("YYYY-MM-DD")}>Hoy</MenuItem>
    {Array.from(
        new Set(horarios.map((horario) => horario.fecha))
    )
    .sort((a, b) => new Date(a) - new Date(b))
    .map((fecha) => {
        const horariosDeFecha = horarios.filter(
            (horario) => horario.fecha === fecha
        );
        const alMenosUnoDisponible = horariosDeFecha.some(
            (horario) => horario.disponible
        );
        if (alMenosUnoDisponible) {
            return (
                dayjs(fecha).format("YYYY-MM-DD") !==
                    dayjs().format("YYYY-MM-DD") && (
                    <MenuItem
                        key={fecha}
                        value={dayjs(fecha).format("YYYY-MM-DD")}
                    >
                        {dayjs(fecha).format("dddd, DD [de] MMMM")}
                    </MenuItem>
                )
            );
        }

        return null;
    })}
</TextField>

                                                        </Grid>
                                                        <Grid
                                                            item
                                                            xs={12}
                                                            sm={3}
                                                        >
                                                            <Button
                                                                onClick={() =>
                                                                    setCalendarioVisible(
                                                                        !calendarioVisible
                                                                    )
                                                                }
                                                                sx={{
                                                                    height: "100%",
                                                                }}
                                                                fullWidth
                                                                variant="solid"
                                                            >
                                                                {calendarioVisible ? (
                                                                    <CalendarMonthOutlinedIcon />
                                                                ) : (
                                                                    <CalendarTodayOutlinedIcon />
                                                                )}
                                                            </Button>
                                                        </Grid>
                                                        <LocalizationProvider
                                                            dateAdapter={
                                                                AdapterDayjs
                                                            }
                                                            locale="es"
                                                        >
                                                            {calendarioVisible && (
                                                                <DateCalendar
                                                                    showDaysOutsideCurrentMonth
                                                                    fixedWeekNumber={
                                                                        6
                                                                    }
                                                                    sx={{
                                                                        border: "1px solid gainsboro",
                                                                        padding:
                                                                            "0",
                                                                        width: "95%",
                                                                        marginTop:
                                                                            "20px",
                                                                    }}
                                                                    value={dayjs(
                                                                        fechaSeleccionada
                                                                    )}
                                                                    onChange={(
                                                                        newValue
                                                                    ) => {
                                                                        setFechaSeleccionada(
                                                                            dayjs(
                                                                                newValue
                                                                            ).format(
                                                                                "YYYY-MM-DD"
                                                                            )
                                                                        );
                                                                        setCalendarioVisible(
                                                                            !calendarioVisible
                                                                        );
                                                                    }}
                                                                />
                                                            )}
                                                        </LocalizationProvider>
                                                    </Grid>
                                                </div>
                                            ) : null}
                                            {horarios.length === 0 ? (
                                                <span className="sinDatos">
                                                    No hay horario disponible
                                                </span>
                                            ) : (
                                                horarios
                                                    .filter((horario) => {
                                                        const hoy =
                                                            dayjs().format(
                                                                "YYYY-MM-DD"
                                                            );
                                                        if (
                                                            fechaSeleccionada !==
                                                            hoy
                                                        ) {
                                                            return (
                                                                dayjs(
                                                                    horario.fecha
                                                                ).format(
                                                                    "YYYY-MM-DD"
                                                                ) ===
                                                                fechaSeleccionada
                                                            );
                                                        }

                                                        const fechaActual =
                                                            dayjs(new Date());
                                                        const fechaHorario =
                                                            dayjs(
                                                                `${horario.fecha} ${horario.hora}`
                                                            );

                                                        const esFechaActual =
                                                            fechaHorario.date() ===
                                                                fechaActual.date() &&
                                                            fechaHorario.month() ===
                                                                fechaActual.month() &&
                                                            fechaHorario.year() ===
                                                                fechaActual.year();
                                                        if (!esFechaActual) {
                                                            return false;
                                                        }

                                                        const horaActual =
                                                            fechaActual.hour() *
                                                                60 +
                                                            fechaActual.minute();
                                                        const horaHorario =
                                                            fechaHorario.hour() *
                                                                60 +
                                                            fechaHorario.minute();

                                                        return (
                                                            horaHorario >=
                                                            horaActual
                                                        );
                                                    })
                                                    .map((horario) => {
                                                        const esEditable =
                                                            modoEdicion &&
                                                            horario.horaExtendida ===
                                                                "";

                                                        return (
                                                            (modoEdicion
                                                                ? esEditable
                                                                : true) &&
                                                            horario.idTrabajador ===
                                                                trabajador._id && (
                                                                <div
                                                                    onClick={() => {
                                                                        if (
                                                                            horario.disponible &&
                                                                            !horario.tomada
                                                                        ) {
                                                                            confirmarCita(
                                                                                trabajador._id,
                                                                                horario,
                                                                                horario
                                                                                    .correoTrabajador
                                                                                    ._id,
                                                                                "Cliente"
                                                                            );
                                                                        }
                                                                    }}
                                                                    key={
                                                                        horario._id
                                                                    }
                                                                    className={`appointment ${
                                                                        horario.enproceso
                                                                            ? "enproceso"
                                                                            : !horario.enproceso &&
                                                                              horario.idCliente
                                                                            ? "iniciado"
                                                                            : "disponible"
                                                                    }`}
                                                                    style={
                                                                        !horario.tomada ||
                                                                        !horario.disponible
                                                                            ? {
                                                                                  width: "350px",
                                                                                  marginTop:
                                                                                      "3px",
                                                                                  marginBottom:
                                                                                      "3px",
                                                                                  cursor: "pointer",
                                                                              }
                                                                            : {
                                                                                  width: "350px",
                                                                                  marginTop:
                                                                                      "7px",
                                                                              }
                                                                    }
                                                                >
                                                                    {horario?.horaExtendida && (
                                                                        <div className="listonExtendida">
                                                                            Hora
                                                                            Extendida
                                                                        </div>
                                                                    )}
                                                                    <input
                                                                        type="hidden"
                                                                        name="horarioId"
                                                                        value={
                                                                            horario._id
                                                                        }
                                                                    />
                                                                    <input
                                                                        type="hidden"
                                                                        name="empleadoId"
                                                                        value={
                                                                            horario
                                                                                .correoTrabajador
                                                                                ._id
                                                                        }
                                                                    />
                                                                    <input
                                                                        type="hidden"
                                                                        name="hora"
                                                                        value={
                                                                            horario.hora
                                                                        }
                                                                    />
                                                                    {citasSeleccionadas.some(
                                                                        (
                                                                            cita
                                                                        ) =>
                                                                            cita.horarioId ===
                                                                            horario._id
                                                                    ) ? (
                                                                        <>
                                                                            <div
                                                                                className="time"
                                                                                style={
                                                                                    horario.tomada
                                                                                        ? {
                                                                                              color: "white",
                                                                                          }
                                                                                        : {
                                                                                              color: "white",
                                                                                          }
                                                                                }
                                                                            >
                                                                                {
                                                                                    horario.hora
                                                                                }
                                                                                <p>
                                                                                    {dayjs(
                                                                                        horario.fecha
                                                                                    ).format(
                                                                                        "dddd, D [de] MMMM"
                                                                                    )}
                                                                                </p>
                                                                            </div>
                                                                            <h3>
                                                                                Seleccionado
                                                                            </h3>
                                                                        </>
                                                                    ) : (
                                                                        <div className="Columnas">
                                                                            <div className="puntoReferencia">
                                                                                {horario.disponible &&
                                                                                !horario.tomada ? (
                                                                                    <p className="ok"></p>
                                                                                ) : !horario.enproceso ? (
                                                                                    <p className="ocupado"></p>
                                                                                ) : (
                                                                                    horario.enproceso && (
                                                                                        <p className="inprocess"></p>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                            <div className="timeContainer">
                                                                                <div className="time">
                                                                                    <p
                                                                                        style={{
                                                                                            fontSize:
                                                                                                "20px",
                                                                                            fontWeight:
                                                                                                "bold",
                                                                                        }}
                                                                                    >
                                                                                        {
                                                                                            horario.hora
                                                                                        }
                                                                                    </p>
                                                                                    <p
                                                                                        style={{
                                                                                            textAlign:
                                                                                                "center",
                                                                                            fontSize:
                                                                                                "14px",
                                                                                        }}
                                                                                    >
                                                                                        {dayjs(
                                                                                            horario.fecha
                                                                                        ).format(
                                                                                            "dddd, D [de] MMMM"
                                                                                        )}
                                                                                    </p>
                                                                                </div>
    
                                                                                <div className="stateContainer">
                                                                                    {horario.disponible &&
                                                                                    !horario.tomada ? (
                                                                                        <>
                                                                                            <p
                                                                                                style={{
                                                                                                    fontSize:
                                                                                                        "18px",
                                                                                                }}
                                                                                            >
                                                                                                DISPONIBLE
                                                                                            </p>
                                                                                            <p
                                                                                                style={{
                                                                                                    fontSize:
                                                                                                        "16px",
                                                                                                }}
                                                                                            >
                                                                                                <EventAvailableOutlinedIcon />
                                                                                            </p>
                                                                                        </>
                                                                                    ) : !horario.enproceso ? (
                                                                                        <>
                                                                                            <p
                                                                                                style={{
                                                                                                    fontSize:
                                                                                                        "18px",
                                                                                                }}
                                                                                            >
                                                                                                OCUPADO
                                                                                            </p>
                                                                                            <p
                                                                                                style={{
                                                                                                    fontSize:
                                                                                                        "16px",
                                                                                                }}
                                                                                            >
                                                                                                <DoNotDisturb />
                                                                                            </p>
                                                                                        </>
                                                                                    ) : (
                                                                                        horario.enproceso && (
                                                                                            <>
                                                                                                <p
                                                                                                    style={{
                                                                                                        fontSize:
                                                                                                            "18px",
                                                                                                        color: "white",
                                                                                                        textWrap:
                                                                                                            "nowrap",
                                                                                                    }}
                                                                                                >
                                                                                                    EN
                                                                                                    PROCESO
                                                                                                </p>
                                                                                                <p
                                                                                                    style={{
                                                                                                        fontSize:
                                                                                                            "16px",
                                                                                                        color: "white",
                                                                                                    }}
                                                                                                >
                                                                                                    <HourglassBottomOutlinedIcon />
                                                                                                </p>
                                                                                            </>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            </div>
    
                                                                            <div
                                                                                className="timeSmall"
                                                                                style={
                                                                                    horario.tomada
                                                                                        ? {
                                                                                              color: "black",
                                                                                          }
                                                                                        : {
                                                                                              color: "white",
                                                                                          }
                                                                                }
                                                                            >
                                                                                {
                                                                                    horario?.horaExtendida
                                                                                }
                                                                            </div>
    
                                                                            <div className="estado"></div>
                                                                            {horario.tomada &&
                                                                                !horario.enproceso &&
                                                                                horario.idCliente ===
                                                                                    ids.idCliente && (
                                                                                    <div className="botonesHorario">
                                                                                        <button
                                                                                            onClick={() =>
                                                                                                handleOpenCancelar(
                                                                                                    horario.idAgenda,
                                                                                                    horario._id,
                                                                                                    horario
                                                                                                        .correoTrabajador
                                                                                                        ._id
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            Cancelar
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        );
                                                    })
                                            )}
                                        </div>
                                    )
                                ) : (mostrarMensajeDescanso || (trabajador.diasDescanso.activo && trabajador.diasDescanso.cuando === dayjs().day())) ? (
                                    <h2
                                        style={{
                                            width: "100%",
                                            textAlign: "center",
                                            marginTop: "20px",
                                        }}
                                    >
                                        {(trabajador.diasDescanso.activo && trabajador.diasDescanso.cuando === dayjs().day()) ? "Este asesor esta descansado vuelve ": "Tus asesores estan descansando, vuelve "}
                                        {diasDescanso.cuando === 1
                                            ? "el lunes"
                                            : "mañana"}
                                        .
                                    </h2>
                                ) : (
                                    <div className="clienteCita">
                                        {horarios.length > 0 ? (
                                            <div className="filtroGrupo">
                                                <label
                                                    htmlFor="fecha-select"
                                                    style={{
                                                        textAlign: "center",
                                                        marginBottom: "5px",
                                                    }}
                                                >
                                                    Filtrar por fecha disponible
                                                </label>
                                                <Grid container spacing={1}>
                                                    <Grid item xs={12} sm={9}>
                                                    <TextField
    select
    fullWidth
    sx={{
        padding: "0px !important",
        margin: "0px !important",
    }}
    variant="outlined"
    id="fecha-select"
    value={fechaSeleccionada || ""}
    onChange={(event) => setFechaSeleccionada(event.target.value)}
>
    <MenuItem value={dayjs().format("YYYY-MM-DD")}>Hoy</MenuItem>
    {Array.from(
        new Set(horarios.map((horario) => horario.fecha))
    )
    .sort((a, b) => new Date(a) - new Date(b))
    .map((fecha) => {
        const horariosDeFecha = horarios.filter(
            (horario) => horario.fecha === fecha
        );
        const alMenosUnoDisponible = horariosDeFecha.some(
            (horario) => horario.disponible
        );
        if (alMenosUnoDisponible) {
            return (
                dayjs(fecha).format("YYYY-MM-DD") !==
                    dayjs().format("YYYY-MM-DD") && (
                    <MenuItem
                        key={fecha}
                        value={dayjs(fecha).format("YYYY-MM-DD")}
                    >
                        {dayjs(fecha).format("dddd, DD [de] MMMM")}
                    </MenuItem>
                )
            );
        }

        return null;
    })}
</TextField>

                                                    </Grid>
                                                    <Grid item xs={12} sm={3}>
                                                        <Button
                                                            onClick={() =>
                                                                setCalendarioVisible(
                                                                    !calendarioVisible
                                                                )
                                                            }
                                                            sx={{
                                                                height: "57px",
                                                            }}
                                                            fullWidth
                                                            variant="solid"
                                                        >
                                                            {calendarioVisible ? (
                                                                <CalendarMonthOutlinedIcon />
                                                            ) : (
                                                                <CalendarTodayOutlinedIcon />
                                                            )}
                                                        </Button>
                                                    </Grid>
                                                    <LocalizationProvider
                                                        dateAdapter={
                                                            AdapterDayjs
                                                        }
                                                        locale="es"
                                                    >
                                                        {calendarioVisible && (
                                                            <DateCalendar
                                                                showDaysOutsideCurrentMonth
                                                                fixedWeekNumber={
                                                                    6
                                                                }
                                                                sx={{
                                                                    border: "1px solid gainsboro",
                                                                    padding:
                                                                        "0",
                                                                    width: "100%",
                                                                    marginTop:
                                                                        "20px",
                                                                }}
                                                                value={dayjs(
                                                                    fechaSeleccionada
                                                                )}
                                                                onChange={(
                                                                    newValue
                                                                ) => {
                                                                    setFechaSeleccionada(
                                                                        dayjs(
                                                                            newValue
                                                                        ).format(
                                                                            "YYYY-MM-DD"
                                                                        )
                                                                    );
                                                                    setCalendarioVisible(
                                                                        !calendarioVisible
                                                                    );
                                                                }}
                                                            />
                                                        )}
                                                    </LocalizationProvider>
                                                </Grid>
                                            </div>
                                        ) : null}
                                        {horarios.length === 0 ? (
                                            <span className="sinDatos">
                                                No hay horario disponible
                                            </span>
                                        ) : (
                                            horarios
                                                .filter((horario) => {
                                                    const hoy =
                                                        dayjs().format(
                                                            "YYYY-MM-DD"
                                                        );
                                                    if (
                                                        fechaSeleccionada !==
                                                        hoy
                                                    ) {
                                                        return (
                                                            dayjs(
                                                                horario.fecha
                                                            ).format(
                                                                "YYYY-MM-DD"
                                                            ) ===
                                                            fechaSeleccionada
                                                        );
                                                    }

                                                    const fechaActual = dayjs(
                                                        new Date()
                                                    );
                                                    const fechaHorario = dayjs(
                                                        `${horario.fecha} ${horario.hora}`
                                                    );

                                                    const esFechaActual =
                                                        fechaHorario.date() ===
                                                            fechaActual.date() &&
                                                        fechaHorario.month() ===
                                                            fechaActual.month() &&
                                                        fechaHorario.year() ===
                                                            fechaActual.year();
                                                    if (!esFechaActual) {
                                                        return false;
                                                    }

                                                    const horaActual =
                                                        fechaActual.hour() *
                                                            60 +
                                                        fechaActual.minute();
                                                    const horaHorario =
                                                        fechaHorario.hour() *
                                                            60 +
                                                        fechaHorario.minute();

                                                    return (
                                                        horaHorario >=
                                                        horaActual
                                                    );
                                                })
                                                .map((horario, index) => {
                                                    const esEditable =
                                                        modoEdicion &&
                                                        horario.horaExtendida ===
                                                            "";
                                                    return (
                                                        (modoEdicion
                                                            ? esEditable
                                                            : true) &&
                                                        horario.idTrabajador ===
                                                            trabajador._id && (
                                                            <div
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    if (
                                                                        esEditable
                                                                    ) {
                                                                        const horarioId =
                                                                            e.currentTarget.querySelector(
                                                                                'input[name="horarioId"]'
                                                                            ).value;
                                                                        const empleadoId =
                                                                            e.currentTarget.querySelector(
                                                                                'input[name="empleadoId"]'
                                                                            ).value;
                                                                        const hora =
                                                                            e.currentTarget.querySelector(
                                                                                'input[name="hora"]'
                                                                            ).value;
                                                                        agregarCita(
                                                                            horarioId,
                                                                            empleadoId,
                                                                            hora,
                                                                            index
                                                                        );
                                                                    } else {
                                                                        if (
                                                                            horario.disponible &&
                                                                            !horario.tomada
                                                                        ) {
                                                                            confirmarCita(
                                                                                trabajador._id,
                                                                                horario,
                                                                                horario
                                                                                    .correoTrabajador
                                                                                    ._id,
                                                                                "AdminLocal"
                                                                            );
                                                                        }
                                                                    }
                                                                }}
                                                                key={
                                                                    horario._id
                                                                }
                                                                className={`appointment ${
                                                                    horario.enproceso
                                                                        ? "enproceso"
                                                                        : !horario.enproceso &&
                                                                          horario.idCliente
                                                                        ? "iniciado"
                                                                        : esEditable
                                                                        ? `disponible ${
                                                                              citasSeleccionadas.some(
                                                                                  (
                                                                                      cita
                                                                                  ) =>
                                                                                      cita.horarioId ===
                                                                                      horario._id
                                                                              )
                                                                                  ? ""
                                                                                  : "seleccionable"
                                                                          }`
                                                                        : "disponible"
                                                                }`}
                                                                style={
                                                                    horario.disponible &&
                                                                    !horario.tomada
                                                                        ? {
                                                                              width: "350px",
                                                                              marginTop:
                                                                                  "3px",
                                                                              marginBottom:
                                                                                  "3px",
                                                                              cursor: "pointer",
                                                                          }
                                                                        : {
                                                                              width: "350px",
                                                                              marginTop:
                                                                                  "7px",
                                                                          }
                                                                }
                                                            >
                                                                {horario?.horaExtendida && (
                                                                    <div className="listonExtendida">
                                                                        Hora
                                                                        Extendida
                                                                    </div>
                                                                )}
                                                                <input
                                                                    type="hidden"
                                                                    name="horarioId"
                                                                    value={
                                                                        horario._id
                                                                    }
                                                                />
                                                                <input
                                                                    type="hidden"
                                                                    name="empleadoId"
                                                                    value={
                                                                        horario
                                                                            .correoTrabajador
                                                                            ._id
                                                                    }
                                                                />
                                                                <input
                                                                    type="hidden"
                                                                    name="hora"
                                                                    value={
                                                                        horario.hora
                                                                    }
                                                                />
                                                                {citasSeleccionadas.some(
                                                                    (cita) =>
                                                                        cita.horarioId ===
                                                                        horario._id
                                                                ) ? (
                                                                    <>
                                                                        <div className="time">
                                                                            <p>
                                                                                {
                                                                                    horario.hora
                                                                                }
                                                                            </p>
                                                                            <p>
                                                                                {dayjs(
                                                                                    horario.fecha
                                                                                ).format(
                                                                                    "dddd, D [de] MMMM"
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                        <h3>
                                                                            Seleccionado
                                                                        </h3>
                                                                    </>
                                                                ) : (
                                                                    <div className="Columnas">
                                                                        <div className="puntoReferencia">
                                                                            {horario.disponible &&
                                                                            !horario.tomada ? (
                                                                                <p className="ok"></p>
                                                                            ) : !horario.enproceso ? (
                                                                                <p className="ocupado"></p>
                                                                            ) : (
                                                                                horario.enproceso && (
                                                                                    <p className="inprocess"></p>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                        <div className="timeContainer">
                                                                            <div className="time">
                                                                                <p
                                                                                    style={{
                                                                                        fontSize:
                                                                                            "20px",
                                                                                        fontWeight:
                                                                                            "bold",
                                                                                    }}
                                                                                >
                                                                                    {
                                                                                        horario.hora
                                                                                    }
                                                                                </p>
                                                                                <p
                                                                                    style={{
                                                                                        textAlign:
                                                                                            "center",
                                                                                        fontSize:
                                                                                            "14px",
                                                                                    }}
                                                                                >
                                                                                    {dayjs(
                                                                                        horario.fecha
                                                                                    ).format(
                                                                                        "dddd, D [de] MMMM"
                                                                                    )}
                                                                                </p>
                                                                            </div>

                                                                            <div className="stateContainer">
                                                                                {horario.disponible &&
                                                                                !horario.tomada ? (
                                                                                    <>
                                                                                        <p
                                                                                            style={{
                                                                                                fontSize:
                                                                                                    "18px",
                                                                                            }}
                                                                                        >
                                                                                            DISPONIBLE
                                                                                        </p>
                                                                                        <p
                                                                                            style={{
                                                                                                fontSize:
                                                                                                    "16px",
                                                                                            }}
                                                                                        >
                                                                                            <EventAvailableOutlinedIcon />
                                                                                        </p>
                                                                                    </>
                                                                                ) : !horario.enproceso ? (
                                                                                    <>
                                                                                        <p
                                                                                            style={{
                                                                                                fontSize:
                                                                                                    "18px",
                                                                                            }}
                                                                                        >
                                                                                            OCUPADO
                                                                                        </p>
                                                                                        <p
                                                                                            style={{
                                                                                                fontSize:
                                                                                                    "16px",
                                                                                            }}
                                                                                        >
                                                                                            <DoNotDisturb />
                                                                                        </p>
                                                                                    </>
                                                                                ) : (
                                                                                    horario.enproceso && (
                                                                                        <>
                                                                                            <p
                                                                                                style={{
                                                                                                    fontSize:
                                                                                                        "18px",
                                                                                                    color: "white",
                                                                                                    textWrap:
                                                                                                        "nowrap",
                                                                                                }}
                                                                                            >
                                                                                                EN
                                                                                                PROCESO
                                                                                            </p>
                                                                                            <p
                                                                                                style={{
                                                                                                    fontSize:
                                                                                                        "16px",
                                                                                                    color: "white",
                                                                                                }}
                                                                                            >
                                                                                                <HourglassBottomOutlinedIcon />
                                                                                            </p>
                                                                                        </>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div
                                                                            className="timeSmall"
                                                                            style={
                                                                                horario.tomada
                                                                                    ? {
                                                                                          color: "black",
                                                                                      }
                                                                                    : {
                                                                                          color: "white",
                                                                                      }
                                                                            }
                                                                        >
                                                                            {
                                                                                horario?.horaExtendida
                                                                            }
                                                                        </div>

                                                                        <div className="estado"></div>
                                                                        {horario.tomada &&
                                                                            !horario.enproceso &&
                                                                            horario.idCliente ===
                                                                                ids.idCliente && (
                                                                                <div className="botonesHorario">
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleOpenCancelar(
                                                                                                horario.idAgenda,
                                                                                                horario._id,
                                                                                                horario
                                                                                                    .correoTrabajador
                                                                                                    ._id
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        Cancelar
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    );
                                                })
                                        )}
                                    </div>
                                )}
                            </Box>
                        ))
                )}
            </div>
            <Dialog
                open={asignarCitaModal}
                onClose={() => setAsignarCitaModal(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Agendar una cita"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Va a programar una cita con este asesor. Al confirmar,
                        el asesor será notificado por correo electrónico.
                    </DialogContentText>
                    <DialogContentText sx={{ margin: "10px 0" }}>
                        Si deja el campo vacío, la cita se asignará
                        automáticamente al Cliente General.
                    </DialogContentText>

                    <div className="servicio">
                        <select
                            required
                            name="servicios"
                            id="servicios"
                            onChange={(e) => {
                                const selectedValue = e.target.value;
                                const selectedServicio = servicios.find(
                                    (servicio) => servicio._id === selectedValue
                                );

                                if (selectedServicio) {
                                    setServicioSeleccionado(
                                        selectedServicio.nombreProducto
                                    );
                                    setServicioId(selectedValue);
                                }
                            }}
                        >
                            {servicios.map((servicio) => (
                                <option
                                    style={{
                                        color: "black",
                                    }}
                                    key={servicio._id}
                                    value={servicio._id}
                                >
                                    {servicio.nombreProducto}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="inputClienteContainer">
                        <input
                            className="seleccionarCliente-input"
                            list="clientes"
                            placeholder="Ingrese el nombre de un cliente"
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                const selectedClient = todosLosClientes.find(
                                    (cliente) =>
                                        cliente.nombre === e.target.value
                                );
                                setClienteSeleccionado(
                                    selectedClient
                                        ? selectedClient._id
                                        : ids.clienteGeneral
                                );
                            }}
                        />
                    </div>
                    <datalist id="clientes">
                        {todosLosClientes.map((cliente) => (
                            <option key={cliente._id} value={cliente.nombre} />
                        ))}
                    </datalist>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleCancelarAsignarCita()}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => handleConfirmarAsignarCita()}
                        autoFocus
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openConfirmar}
                onClose={setOpenConfirmar}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Agendar una cita"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Está a punto de programar una cita con este asesor el
                        dia{" "}
                        <b>{`${dayjs(fechaSeleccionada).format(
                            "dddd, D [de] MMMM"
                        )}`}</b>{" "}
                        a las <b>{`${hora}`}</b>.
                    </DialogContentText>
                    <DialogContentText margin={"15px 0"}>
                        Una vez que haga clic en confirmar, el asesor será
                        notificado y recibirá un correo electrónico con los
                        detalles.
                    </DialogContentText>
                    <div className="servicio">
                        <select
                            required
                            name="servicios"
                            id="servicios"
                            onChange={(e) => {
                                const selectedValue = e.target.value;
                                const selectedServicio = servicios.find(
                                    (servicio) => servicio._id === selectedValue
                                );

                                if (selectedServicio) {
                                    setServicioSeleccionado(
                                        selectedServicio.nombreProducto
                                    );
                                    setServicioId(selectedValue);
                                }
                            }}
                        >
                            {servicios.map((servicio) => (
                                <option
                                    style={{
                                        color: "black",
                                    }}
                                    key={servicio._id}
                                    value={servicio._id}
                                >
                                    {servicio.nombreProducto}
                                </option>
                            ))}
                        </select>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleCancelarConfirmaCita()}>
                        Cancelar
                    </Button>
                    <Button onClick={() => handleConfirmaCita()} autoFocus>
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={openCancelar}
                onClose={handleCloseCancelar}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Desea cancelar esta cita?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        En caso de que cancele una cita, se le asignará un
                        strike adicional, y al alcanzar el máximo de 3 strikes,
                        su cuenta será suspendida debido al uso inadecuado de
                        nuestros servicios.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCancelar}>Cancelar</Button>
                    <Button onClick={() => confirmarCancelarCita()} autoFocus>
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
            <Toaster />
        </div>
    );
}