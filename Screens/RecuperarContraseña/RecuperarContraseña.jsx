import { useState } from "react";
import { TextField, Button, Box, Paper } from "@mui/material";
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet";
import "./RecuperarContraseña.css"
import NavbarMobile from "../../Components/NavbarMobile/NavbarMobile";
import { useNavigate } from "react-router-dom";

function RecuperarContraseña() {
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("");
  const [codigo, setCodigo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [mostrarValidarContrasena, setMostrarValidarContrasena] =
  useState(false);
  const Url = import.meta.env.VITE_APP_BACKEND_URL;
  const roles = ["Local", "Trabajador", "Cliente", "Empresa"];

  const navigate = useNavigate()

  const notify = (mensaje) => toast.error(mensaje);
  const success = (mensaje) => toast.success(mensaje);

  const handleEmailChange = (event) => {
    setCorreo(event.target.value);
  };

   const handleRoleChange = (event) => {
     setRol(event.target.value);
   };

  const handleCodigoChange = (event) => {
    setCodigo(event.target.value);
  };

  const handleNuevaContrasenaChange = (event) => {
    setContraseña(event.target.value);
  };

  const recuperarContrasena = async () => {
    toast.remove();
    try {
      const response = await fetch(`${Url}/user/recuperarContrasena`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo: correo.toLocaleLowerCase(), rol }),
      });

      if (!response.ok) {
        throw new Error("Error al recuperar contraseña");
      }

      const data = await response.json();
      localStorage.setItem("recoveryToken", data.token);
      success(
        "Correo enviado. Por favor, verifica tu email para el código de recuperación."
      );
      setMostrarValidarContrasena(true);
    } catch (error) {
      console.error("Error en la recuperación:", error);
      notify("Error al recuperar contraseña");
    }
  };

  const validarContrasena = async () => {
    toast.remove();
    const token = localStorage.getItem("recoveryToken");
    try {
      const response = await fetch(`${Url}/user/validarContrasena`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ codigo, contraseña, token }),
      });

      if (!response.ok) {
        throw new Error("Error al validar contraseña");
      }else{
        const data = await response.json()
        success("Contraseña actualizada con éxito");
        if(rol === "SuperAdmin"){
          navigate("/developer/root")
        }else{
          navigate(`/login/${rol}/${rol === "Empresa" ? data.idEmpresa: data.idLocal}`)
        }
      }


    } catch (error) {
      console.error("Error en la validación:", error);
      notify("Error al validar contraseña");
    }
  };

  return (
    <div>
      <Helmet title="Recuperar Contraseña - Apps for the World" />
      <NavbarMobile />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          padding: 2,
        }}
      >
        <Paper
          sx={{
            margin: "auto",
            boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
            padding: "20px",
            maxWidth: "500px",
            width: "100%",
            overflow: "hidden",
            borderRadius: "8px",
          }}
        >
          <div className="recuperar-contraseña">
            <h2 style={{ textAlign: "center", margin: "10px 0" }}>
              <b>Recuperar Contraseña</b>
            </h2>
            {!mostrarValidarContrasena && (
              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  recuperarContrasena();
                }}
                sx={{ marginBottom: "20px" }}
              >
                <TextField
                  label="Correo electrónico"
                  value={correo}
                  onChange={handleEmailChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
                <label htmlFor="role">Rol</label>
                <select
                  required
                  id="role"
                  name="role"
                  value={rol}
                  onChange={handleRoleChange}
                >
                  <option value="">Seleccionar rol</option>
                  {roles.map((role, index) => (
                    <option key={index} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginTop: "15px" }}
                >
                  Recuperar Contraseña
                </Button>
              </Box>
            )}
            {mostrarValidarContrasena && (
              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  validarContrasena();
                }}
              >
                <TextField
                  label="Código de Recuperación"
                  value={codigo}
                  onChange={handleCodigoChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  label="Nueva Contraseña"
                  type="password"
                  value={contraseña}
                  onChange={handleNuevaContrasenaChange}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  fullWidth
                  sx={{ marginTop: "15px" }}
                >
                  Validar Nueva Contraseña
                </Button>
              </Box>
            )}
            <Toaster />
          </div>
        </Paper>
      </Box>
    </div>
  );
}

export default RecuperarContraseña;