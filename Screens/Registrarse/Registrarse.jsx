import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Cliente.css";
import {
    TextField,
    Button,
    Checkbox,
    FormControlLabel,
    Grid,
} from "@mui/material";
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet";
import { GoogleLoginButton } from "../../Components/OAuthServices/GoogleLogin";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { DatePicker, LocalizationProvider, MobileDatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
const Url = import.meta.env.VITE_APP_BACKEND_URL;

export default function RegistroCliente() {
    const { idEmpresa, idLocal } = useParams();
    const [formData, setFormData] = useState({
        nombre: "",
        correo: "",
        telefono: "",
        cumpleaños: dayjs(),
        contraseña: "",
        metodo: "normal",
    });
    const [localData, setLocalData] = useState([]);
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const exito = (mensaje) => toast.success(mensaje);
    const error = (mensaje) => toast.error(mensaje);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `${Url}/Admin/clientes/${idEmpresa}/${idLocal}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.mensaje);
            } else {
                exito("Te has registrado correctamente");
                setTimeout(() => {
                    navigate(`/login/cliente/${idLocal}`);
                }, 1000);
            }
        } catch (err) {
            error(err.message);
        }
    };

    const obtenerInfoLocal = async () => {
        try {
            const response = await fetch(`${Url}/empresa/info/${idLocal}`, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error("No se encontró la información del local");
            } else {
                const data = await response.json();
                setLocalData(data);
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        obtenerInfoLocal();
    }, []);

    return (
        <div
            className="formWrapper"
            style={{
                backgroundImage: `url(${localData.imgLogin})`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
            }}
        >
            <Helmet title={`Registrarse en ${localData.nombreLocal}`} />
            <div className="registro-cliente-container">
                <h2>Registro de Cliente</h2>
                <h3 style={{ textAlign: "center" }}>{localData.nombreLocal}</h3>
                <div className="seccion-image-local">
                    <img src={localData.localImg} alt="Local" />
                </div>
                <div
                    disabled={!aceptaTerminos}
                    style={{
                        cursor: aceptaTerminos ? "pointer" : "not-allowed",
                    }}
                    className="botonesInicio"
                >
                    <GoogleLoginButton
                        style={{ zIndex: aceptaTerminos ? "+1" : "-1" }}
                        metodo="registro"
                    />
                </div>
                <form onSubmit={handleSubmit} className="registro-cliente-form">
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={12}>
                            <TextField
                                fullWidth
                                label="Nombre"
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                placeholder="Emilio..."
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} sm={12}>
                            <TextField
                                fullWidth
                                label="Correo"
                                type="email"
                                name="correo"
                                placeholder="emilio@email.com"
                                value={formData.correo}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} sm={12}>
                            <TextField
                                fullWidth
                                label="Teléfono"
                                type="tel"
                                name="telefono"
                                placeholder="12345678"
                                value={formData.telefono}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item sx={{position: "relative"}} xs={12} sm={12}>
                            <Button
                                onClick={() => {
                                    setShowPassword(!showPassword)
                                }}
                                sx={{
                                    width: "10px !important",
                                    padding: "0 !important",
                                    border: "none !important",
                                    borderRadius: "0 !important",
                                    color: "black !important",
                                    background: "none !important",
                                    margin: "0 !important",
                                    position: "absolute",
                                    zIndex: 10,
                                    right: 0,
                                    bottom: 16
                                }}
                            >
                                {showPassword ? (
                                    <VisibilityIcon />
                                ) : (
                                    <VisibilityOffIcon />
                                )}
                            </Button>
                            <TextField
                                fullWidth
                                label="Contraseña"
                                type={showPassword ? "text": "password"}
                                name="contraseña"
                                value={formData.contraseña}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} sm={12}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <MobileDatePicker 
                                
                                label="Fecha de cumpleaños"
                                type="date"
                                name="cumpleaños"
                                value={formData.cumpleaños}
                                onChange={handleChange}
                                sx={{width: "100%"}}
                                
                            />
                            </LocalizationProvider>
                            
                        </Grid>
                    </Grid>

                    <div className="checkbox-container">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={aceptaTerminos}
                                    onClick={() =>
                                        setAceptaTerminos(!aceptaTerminos)
                                    }
                                />
                            }
                            label={
                                <span>
                                    Acepto los{" "}
                                    <a href="/terminosycondiciones">
                                        términos y condiciones
                                    </a>
                                </span>
                            }
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={!aceptaTerminos}
                        style={{
                            cursor: aceptaTerminos ? "pointer" : "not-allowed",
                            marginTop: "15px",
                            color: aceptaTerminos ? "white" : "rgba(100, 100, 100, 0.15)",
                        }}
                    >
                        Finalizar
                    </Button>
                </form>
            </div>
            <Toaster />
        </div>
    );
}