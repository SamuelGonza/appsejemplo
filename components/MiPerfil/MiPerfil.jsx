import { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import toast, { Toaster } from "react-hot-toast";
import {
  Container,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Modal,
  Card,
  CardContent,
  TextField,
  Checkbox,
  Box,
  ListItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SubirImagenes from "../InputImagenes/SubirImagenes";
import NavbarMobile from "../NavbarMobile/NavbarMobile";
import { Helmet } from "react-helmet"

function MiPerfil() {
  const [profileImage, setProfileImage] = useState("/default-avatar.png");
  const apiUrl = import.meta.env.VITE_APP_BACKEND_URL;
  const ids = JSON.parse(localStorage.getItem("ids"));
  const rol = localStorage.getItem("rol");
  const [openModal, setOpenModal] = useState(false);
  const [openModalContraseña, setOpenModalContraseña] = useState(false);
  const [perfilData, setPerfilData] = useState({});
  const [contraseñaAntigua, setContraseñaAntigua] = useState("");
  const [contraseñaNueva, setContraseñaNueva] = useState("");
  const [confirmarCitas, setConfirmarCitas] = useState(false);
  const [activarClientes, setActivarCliente] = useState(true);
  const [stockProductos, setStockProductos] = useState(true);
  const [finalizarCitas, setFinalizarCitas] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1025);
  const [diasDescanso, setDiasDescanso] = useState({
    activo: true,
    cuando: 1
  });
  const [diasDescansoTrabajador, setDiasDescansoTrabajador] = useState({
    activo: true,
    cuando: 1
  });
  const [ajustesData, setAjustesData] = useState([]);
  const notify = (mensaje) => toast.error(mensaje);
  const success = (mensaje) => toast.success(mensaje);

  useEffect(() => {
    obtenerInfoPerfil();
  }, []);

  const obtenerInfoPerfil = async () => {
    try {
      let url;
      if (rol === "AdminLocal") {
        url = `${apiUrl}/Admin/administrador/${ids.idAdmin}`;
      } else if (rol === "Trabajador") {
        url = `${apiUrl}/Admin/trabajador/${ids.idTrabajador}`;
      } else if (rol === "Cliente") {
        url = `${apiUrl}/Admin/cliente/${ids.idCliente}`;
      } else if (rol === "Empresa") {
        url = `${apiUrl}/SuperAdmin/administrador/${ids.idEmpresaAdmin}`;
      }

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          authorization: localStorage.getItem("token"),
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener la información del perfil");
      }



      let elegirImagenDePerfil = (data) => {
        if (data.imgCliente) {
          return data.imgCliente;
        } else if (data.imgTrabajador) {
          return data.imgTrabajador;
        } else if (data.imgAdminLocal){
          return data.imgAdminLocal
        }else {
          return data.imgAdministrador;
        }
      };

      const data = await response.json();
      setProfileImage(elegirImagenDePerfil(data));
      setPerfilData(data);
      setDiasDescansoTrabajador(data.diasDescanso)
    } catch (error) {
      console.error("Error al obtener la información del perfil:", error);
      notify("Error al obtener la información del perfil");
    }
  };

  const handleImageUpload = async () => {
    try {
      let url;
      if (rol === "AdminLocal") {
        url = `${apiUrl}/Admin/administrador/${ids.idAdmin}`;
      } else if (rol === "Trabajador") {
        url = `${apiUrl}/Admin/trabajadores/${ids.idTrabajador}`;
      } else if (rol === "Cliente") {
        url = `${apiUrl}/Admin/clientes/${ids.idCliente}`;
      } else if (rol === "Empresa") {
        url = `${apiUrl}/SuperAdmin/administrador/${ids.idEmpresaAdmin}`;
      }

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          img: profileImage,
          validarImagen: true,
          ...perfilData,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el perfil");
      } else {
        success("Perfil actualizado con éxito");
        handleClose();
      }
    } catch (error) {
      console.error(error.message);
      notify("No se pudo actualizar el perfil");
    }
  };

  const actualizarAjustes = async () => {
    const body = {
      ajustesNuevos: {
        ajustes: {
          confirmarCitas,
          activarClientes,
          stockProductos,
          finalizarCitaAdmin: finalizarCitas,
          diasDescanso
        },
      },
    };
    try {
      const response = await fetch(
        `${apiUrl}/local/cambiarAjustes/${ids.idLocal}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error("No pudimos actualizar la informacion");
      } else {
        traerAjustes();
        success("Ajustes actualizados correctamente");
      }
    } catch (err) {
      console.log(err);
    }
  };
  
  const actualizarAjustesTrabajador = async () => {
    const body = {
      ajustesNuevos: {
        diasDescansoTrabajador
      },
    };
    try {
      const response = await fetch(
        `${apiUrl}/trabajador/ajustes/${perfilData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error("No pudimos actualizar la informacion");
      } else {
        obtenerInfoPerfil()
        success("Ajustes actualizados correctamente");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const traerAjustes = async () => {
    try {
      const response = await fetch(`${apiUrl}/local/ajustes/${ids.idLocal}`, {
        headers: {
          "Content-Type": "application/json",
          authorization: localStorage.getItem("token"),
        },
      });

      if (!response.ok) {
        throw new Error("Tenemos un problema al traer los ajustes");
      } else {
        const data = await response.json();
        setAjustesData(data);
        setConfirmarCitas(data.ajustes.confirmarCitas);
        setActivarCliente(data.ajustes.activarClientes);
        setStockProductos(data.ajustes.stockProductos);
        setFinalizarCitas(data.ajustes.finalizarCitaAdmin);
        setDiasDescanso(data.ajustes.diasDescanso || {
          activo: true,
          cuando: 1
        })
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmitPassword = async () => {
    try {
      let endpoint;
      switch (rol) {
        case "AdminLocal":
          endpoint = `/user/cambiarContrasena/${ids.idAdmin}`;
          break;
        case "Trabajador":
          endpoint = `/user/cambiarContrasena/${ids.idTrabajador}`;
          break;
        case "Cliente":
          endpoint = `/user/cambiarContrasena/${ids.idCliente}`;
          break;
        case "Empresa":
          endpoint = `/user/cambiarContrasena/${ids.idEmpresaAdmin}`;
          break;
        default:
          throw new Error("Rol no válido");
      }

      const url = `${apiUrl}${endpoint}`;
      const requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        },
        body: JSON.stringify({
          rol,
          contraseñaAntigua,
          contraseñaNueva,
        }),
      };
      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        throw new Error("No se pudo cambiar la contraseña");
      } else {
        success("Contraseña cambiada con éxito");
        handleCloseContraseña();
      }
    } catch (error) {
      console.error(error.message);
      notify("No se pudo cambiar la contraseña");
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const handleOpenModalContraseña = () => {
    setOpenModalContraseña(true);
  };

  const handleCloseContraseña = () => {
    setOpenModalContraseña(false);
  };

  const handleChangePassword = (e) => {
    const { name, value } = e.target;
    if (name === "contraseñaAntigua") {
      setContraseñaAntigua(value);
    } else if (name === "contraseñaNueva") {
      setContraseñaNueva(value);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerfilData({
      ...perfilData,
      [name]: value,
    });
  };

  useEffect(() => {
    if (rol === "AdminLocal") {
      traerAjustes();
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.innerWidth <= 1025);
    };

    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
    };
}, []);

const style = {
  width: '95%',
  height: 'auto',
  margin: "auto",
  marginTop: isMobile ? '40px' : '140px',
  ...(isMobile && { marginBottom: '140px' }),
};

  return (
    <>
    <Helmet title="Mi perfil - Apps for the World" />
      <NavbarMobile />
      <div
        style={style}
        className="ContainerMayor"
      >
        <Container
          sx={{
            width: "95%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0",
          }}
        >
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            style={{ minHeight: "40vh", paddingLeft: "0px !important" }}
          >
            <Grid item xs={12} sm={6}>
              <Paper
                elevation={3}
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                  borderRadius: "10px",
                }}
              >
                <Avatar
                  src={profileImage}
                  alt="Imagen de perfil"
                  style={{
                    width: "80px",
                    height: "80px",
                    marginBottom: "16px",
                  }}
                />
                <Typography variant="h5" gutterBottom>
                  Mi Perfil
                </Typography>
                <Divider style={{ marginBottom: "16px", width: "100%" }} />
                <Grid container spacing={0}>
                  <Grid item xs={6}>
                    <Typography variant="body2" gutterBottom>
                      Nombre: {perfilData.nombre}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" 
                      sx={{maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis"}}
                    gutterBottom>
                      Correo: {perfilData.correo}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" gutterBottom>
                      Teléfono: {perfilData.telefono}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" gutterBottom>
                      Dirección: {perfilData.direccion}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider style={{ marginBottom: "10px", width: "100%" }} />
                <List>
                  <ListItemButton
                    component={Button}
                    sx={{ padding: 0 }}
                    onClick={handleOpenModalContraseña}
                  >
                    <ListItemIcon>
                      <EditIcon />
                    </ListItemIcon>
                    <ListItemText
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: "bold",
                      }}
                      primary="Cambiar Contraseña"
                      secondary="Haz clic para cambiar tu contraseña"
                    />
                  </ListItemButton>

                  <ListItemButton
                    component={Button}
                    sx={{ padding: 0 }}
                    onClick={handleOpenModal}
                  >
                    <ListItemIcon>
                      <EditIcon />
                    </ListItemIcon>
                    <ListItemText
                      sx={{
                        textTransform: "capitalize",
                      }}
                      primary="Actualizar Informacion"
                      secondary="Haz clic para cambiar tu informacion"
                      primaryTypographyProps={{
                        variant: "body1",
                      }}
                      secondaryTypographyProps={{
                        variant: "body2",
                      }}
                    />
                  </ListItemButton>

                  {rol === "AdminLocal" && (
                    <>
                      <ListItemButton
                        sx={{ padding: 0 }}
                        onClick={() => {
                          setConfirmarCitas(!confirmarCitas);
                        }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            checked={confirmarCitas}
                            onChange={handleChange}
                            name="confirmarCitas"
                            color="primary"
                            sx={{ padding: 0 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="Aceptar las citas antes de agendarlas"
                          secondary="Activa esta opcion si deseas que las citas sean aceptadas antes de agendarlas"
                        />
                      </ListItemButton>
                      <ListItemButton
                        sx={{ padding: 0 }}
                        onClick={() => {
                          setActivarCliente(!activarClientes);
                        }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            checked={activarClientes}
                            onChange={handleChange}
                            name="confirmarCliente"
                            color="primary"
                            sx={{ padding: 0 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="Clientes activados automaticamente"
                          secondary="Deshabilita esta opción para tener control manual sobre la activación de clientes en tu establecimiento, permitiéndoles operar únicamente cuando sea necesario."
                        />
                      </ListItemButton>
                      <ListItemButton
                        sx={{ padding: 0 }}
                        onClick={() => {
                          setStockProductos(!stockProductos);
                        }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            checked={stockProductos}
                            onChange={handleChange}
                            name="stockProductos"
                            color="primary"
                            sx={{ padding: 0 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="Productos con stock"
                          secondary="Si decides desactivar esta configuración, cada transacción de venta que efectúes no disminuirá la cantidad disponible en el inventario correspondiente a cada artículo."
                        />
                      </ListItemButton>
                      <ListItemButton
                        sx={{ padding: 0 }}
                        onClick={() => {
                          setFinalizarCitas(!finalizarCitas);
                        }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            checked={finalizarCitas}
                            onChange={handleChange}
                            name="stockProductos"
                            color="primary"
                            sx={{ padding: 0 }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary="Finalizar"
                          secondary="Si activas esta opcion, tu tambien podras finalizar las citas en progreso de los empleados."
                        />
                      </ListItemButton>
                      <Typography variant="h6">
                        Horarios
                      </Typography>
                      <ListItem sx={{ padding: 0 }}>
                        <ListItemIcon>
                          <Checkbox
                            checked={diasDescanso.activo}
                            onChange={handleChange}
                            onClick={() => {
                              setDiasDescanso({
                                ...diasDescanso,
                                activo: !diasDescanso.activo
                              });
                            }}
                            name="stockProductos"
                            color="primary"
                            sx={{ padding: 0 }}
                          />
                        </ListItemIcon>
                        <div>
                          <ListItemText
                            primary="Días de descanso"
                            secondary="Establece los días de descanso para evitar la programación de citas y notificaciones de tus clientes"
                          />
                          <select value={diasDescanso.cuando} onChange={(e) => setDiasDescanso({
                                ...diasDescanso,
                                cuando: parseInt(e.target.value)
                              })} 
                              style={{
                                width: "170px",
                                margin: "auto",
                                height: "40px",
                                marginBottom: "10px",
                                cursor: "pointer",
                                borderRadius: "8px",
                                paddingLeft: "7px",
                              }}
                              disabled={!diasDescanso.activo}>
                            <option value="1">Fines de semana</option>
                            <option value="2">Sábados</option>
                            <option value="3">Domingos</option>
                          </select>
                        </div>
                      </ListItem>
                    </>
                  )}

                  {rol === "Trabajador" && (
                    <ListItem sx={{ padding: 0 }}>
                    <ListItemIcon>
                      <Checkbox
                        checked={diasDescansoTrabajador.activo}
                        onChange={handleChange}
                        onClick={() => {
                          setDiasDescansoTrabajador({
                            ...diasDescansoTrabajador,
                            activo: !diasDescansoTrabajador.activo
                          });
                        }}
                        name="stockProductos"
                        color="primary"
                        sx={{ padding: 0 }}
                      />
                    </ListItemIcon>
                    <div>
                      <ListItemText
                        primary="Días de descanso"
                        secondary="Establece los días de descanso para evitar la programación de citas y notificaciones de tus clientes"
                      />
                      <select value={diasDescansoTrabajador.cuando} onChange={(e) => setDiasDescansoTrabajador({
                            ...diasDescansoTrabajador,
                            cuando: parseInt(e.target.value)
                          })} 
                          style={{
                            width: "170px",
                            margin: "auto",
                            height: "40px",
                            marginBottom: "10px",
                            cursor: "pointer",
                            borderRadius: "8px",
                            paddingLeft: "7px",
                          }}
                          disabled={!diasDescansoTrabajador.activo}>
                        <option value="1">Lunes</option>
                        <option value="2">Martes</option>
                        <option value="3">Miercoles</option>
                        <option value="4">Jueves</option>
                        <option value="5">Viernes</option>
                        <option value="6">Sábados</option>
                        <option value="0">Domingos</option>
                      </select>
                    </div>
                  </ListItem>
                  )}
                </List>
                {rol === "AdminLocal" && (
                  <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button
                      onClick={() => actualizarAjustes()}
                      disabled={
                        (confirmarCitas ===
                          ajustesData.ajustes?.confirmarCitas &&
                          activarClientes ===
                            ajustesData.ajustes?.activarClientes &&
                          stockProductos ===
                            ajustesData.ajustes?.stockProductos && 
                            finalizarCitas ===
                            ajustesData.ajustes?.finalizarCitaAdmin && 
                            ajustesData.ajustes.diasDescanso.activo === diasDescanso.activo &&
                            ajustesData.ajustes.diasDescanso.cuando === diasDescanso.cuando
                          )||
                        false
                      }
                      variant="contained"
                      color="primary"
                    >
                      Guardar Configuración
                    </Button>
                  </Box>
                )}
                {rol === "Trabajador" && (
                  <Box mt={2} display="flex" justifyContent="flex-end">
                  <Button
                    onClick={() => actualizarAjustesTrabajador()}
                    disabled={(perfilData?.diasDescanso?.activo === diasDescansoTrabajador.activo && perfilData?.diasDescanso?.cuando === diasDescansoTrabajador.cuando) || false }
                    variant="contained"
                    color="primary"
                  >
                    Guardar Configuración
                  </Button>
                </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </div>
      <Modal
        open={openModal}
        onClose={handleClose}
        closeAfterTransition
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card
          style={{
            outline: "none",
            padding: "20px",
            width: "700px",
            maxHeight: "700px",
          }}
        >
          <CardContent>
            <Typography variant="h6">Actualizar Perfil</Typography>

            <Grid container spacing={1}>
              <Grid item xs={6}>
                <TextField
                  label="Nombre"
                  name="nombre"
                  value={perfilData.nombre}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Correo Electrónico"
                  name="correo"
                  type="email"
                  value={perfilData.correo}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Teléfono"
                  name="telefono"
                  type="number"
                  value={perfilData.telefono}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Dirección"
                  name="direccion"
                  value={perfilData.direccion}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={6}>
                <SubirImagenes establecerImg={setProfileImage} />
              </Grid>
              <Grid item xs={6}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  style={{ marginTop: "20px" }}
                  onClick={handleImageUpload}
                >
                  Actualizar Perfil
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Modal>
      <Modal
        open={openModalContraseña}
        onClose={handleCloseContraseña}
        closeAfterTransition
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Card
          style={{
            outline: "none",
            padding: "20px",
            maxWidth: "700px",
            maxHeight: "700px",
          }}
        >
          {" "}
          <CardContent>
            <Typography variant="h6">Cambiar Contraseña</Typography>
            <TextField
              label="Contraseña Actual"
              name="contraseñaAntigua"
              value={contraseñaAntigua}
              onChange={handleChangePassword}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Contraseña Nueva"
              name="contraseñaNueva"
              value={contraseñaNueva}
              onChange={handleChangePassword}
              fullWidth
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginTop: "20px" }}
              onClick={handleSubmitPassword}
            >
              Cambiar Contraseña
            </Button>
          </CardContent>
        </Card>
      </Modal>
      <Toaster />
    </>
  );
}

export default MiPerfil;