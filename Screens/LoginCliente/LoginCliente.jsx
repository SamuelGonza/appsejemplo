import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet";
import { GoogleLoginButton } from "../../Components/OAuthServices/GoogleLogin";
const Url = import.meta.env.VITE_APP_BACKEND_URL;
import "./Login.css";
import { io } from "socket.io-client";
const socket = io(Url);

function LoginCliente() {
    const [usuario, setUsuario] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [dataLocal, setDataLocal] = useState("");
    const { rol, idLocal } = useParams();
    const [role, setRole] = useState("");
    let [intentos, setIntentos] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (rol === "empresa") {
            traerDatosEmpresa();
        } else {
            traerDatosLocal();
        }
    }, []);

    const error = (mensaje) => toast.error(mensaje);

    const traerDatosEmpresa = async () => {
        toast.remove();
        try {
            const response = await fetch(`${Url}/Admin/data/${idLocal}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error(
                    "Error al obtener la información de la empresa"
                );
            }
            const localData = await response.json();
            setDataLocal(localData);
        } catch (error) {
            setDataLocal({ _id: null });
        }
    };

    const traerDatosLocal = async () => {
        toast.remove();
        try {
            const response = await fetch(
                `${Url}/local/infoIngreso/${idLocal}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Error al obtener la información del local");
            }
            const localData = await response.json();
            setDataLocal(localData);
        } catch (error) {
            setDataLocal({ _id: null });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "username") {
            setUsuario(value);
        } else if (name === "password") {
            setContraseña(value);

            setRole(rol);
        }
    };

    const handleFetch = async (url) => {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    correo: usuario.toLocaleLowerCase(),
                    contraseña,
                    metodo: "normal",
                    idLocal,
                }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                if (response.status === 403) {
                    setIntentos((intentos += 1));
                    if (intentos === 5) {
                        navigate("/RecuperarContraseña");
                    }
                    throw new Error(data.mensaje);
                } else {
                    throw new Error(data.mensaje);
                }
            } else {
                localStorage.setItem("token", data.token);
                localStorage.setItem("rol", data.rol);
                if (data.rol === "AdminLocal") {
                    localStorage.setItem(
                        "ids",
                        JSON.stringify({
                            idEmpresa: data.idEmpresa,
                            idLocal: data.idLocal,
                            qr: data.qr,
                            idAdmin: data.idAdmin,
                            clienteGeneral: data.clienteGeneral,
                        })
                    );
                } else if (data.rol === "Trabajador") {
                    localStorage.setItem(
                        "ids",
                        JSON.stringify({
                            idEmpresa: data.idEmpresa,
                            idLocal: data.idLocal,
                            idTrabajador: data.idTrabajador,
                        })
                    );
                } else if (data.rol === "Cliente") {
                    localStorage.setItem(
                        "ids",
                        JSON.stringify({
                            idEmpresa: data.idEmpresa,
                            idLocal: data.idLocal,
                            idCliente: data.idCliente,
                        })
                    );
                } else if (data.rol === "Empresa") {
                    localStorage.setItem(
                        "ids",
                        JSON.stringify({
                            idEmpresa: data.idEmpresa,
                            idEmpresaAdmin: data.idEmpresaAdmin,
                        })
                    );
                }
                navigate("/inicio");
            }
        } catch (err) {
            console.log("hola")
            error(`${err.message}`);
        }
    };
    

    const logear = async (e) => {
        e.preventDefault();
        if (role === "empresa") {
            await handleFetch(`${Url}/Admin/login`);
        } else if (role === "local") {
            await handleFetch(`${Url}/local/login`);
        } else if (role === "trabajador") {
            await handleFetch(`${Url}/trabajador/login`);
        } else {
            await handleFetch(`${Url}/cliente/login`);
        }
    };

    return (
        <>
            <Helmet title="Iniciar Sesión - Apps for the World" />
            <div className="contenedor-login">
                <div
                    className="seccion-imagen"
                    style={{
                        backgroundImage: `url("https://i.pinimg.com/originals/45/7b/52/457b52b1b22721cbee46639cfef6283d.png")`,
                    }}
                >
                    {dataLocal && (
                        <img
                            src={
                                dataLocal.imgLogin
                                    ? dataLocal.imgLogin
                                    : "https://i.pinimg.com/originals/45/7b/52/457b52b1b22721cbee46639cfef6283d.png"
                            }
                            alt="Local"
                        />
                    )}
                </div>
                <div className="formulario-contenedor">
                    {dataLocal._id === null || !idLocal ? (
                        <div
                            className="errorLoginContainer"
                            style={{
                                textAlign: "center",
                                width: "500px",
                                height: "400px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "30px",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Helmet title="Tenemos problemas - Apps for the World" />
                            <h1 style={{ fontSize: "3em", color: "white" }}>
                                Tenemos problemas
                            </h1>
                            <div
                                className="demasErrorTexto"
                                style={{
                                    width: "400px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "30px",
                                    alignItems: "center",
                                    color: "white",
                                    
                                }}
                            >
                                <h3 style={{fontWeight: "100"}}>
                                    Parece ser que{" "}
                                    {rol === "empresa"
                                        ? "la empresa"
                                        : "el local"}{" "}
                                    no está disponible o los detalles
                                    proporcionados son incorrectos. Por favor,
                                    verifica que estás accediendo al enlace
                                    correcto.
                                </h3>
                                <p>
                                    Si piensas que esto es un error, por favor
                                    contáctanos enviando un correo electrónico a{" "}
                                    <a style={{color: "gray"}} href="mailto:desarrollo@tecnotics.com">
                                        desarrollo@tecnotics.com
                                    </a>
                                    .
                                </p>

                                <NavLink to="/" className="botonNormal">
                                    Volver al inicio
                                </NavLink>
                            </div>
                        </div>
                    ) : (
                        <form className="formulario-login" onSubmit={logear}>
                            <h3>
                                <b>Iniciar Sesión</b>
                                <br />
                                <b>{dataLocal.nombreLocal}</b>
                            </h3>
                            <div className="logo-empresa">
                                <img
                                    src={
                                        dataLocal.localImg
                                            ? dataLocal.localImg
                                            : dataLocal.imgEmpresa
                                            ? dataLocal.imgEmpresa
                                            : "https://st4.depositphotos.com/4329009/19956/v/450/depositphotos_199564354-stock-illustration-creative-vector-illustration-default-avatar.jpg"
                                    }
                                    alt="Local"
                                />
                            </div>
                            {(rol === "Cliente" || rol === "cliente") && (
                                <div className="otros">
                                    <p>Inicia sesión con</p>
                                    <div className="botonesInicio">
                                        <GoogleLoginButton metodo="login" />
                                    </div>
                                </div>
                            )}
                            <label htmlFor="username">Correo</label>
                            <input
                                type="email"
                                placeholder="Nombre de usuario"
                                required
                                id="username"
                                name="username"
                                value={usuario}
                                onChange={handleChange}
                            />

                            <label htmlFor="password">Contraseña</label>
                            <input
                                type="password"
                                placeholder="Contraseña"
                                id="password"
                                name="password"
                                value={contraseña}
                                onChange={handleChange}
                                required
                            />
                            <button
                                className="boton-iniciar-sesion"
                                type="submit"
                            >
                                Iniciar Sesión
                            </button>
                            <div className="social">
                                <div>
                                    <Link to="/RecuperarContraseña">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            <Toaster />
        </>
    );
}

export default LoginCliente;