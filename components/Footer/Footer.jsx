import {
    Facebook,
    Twitter,
    Instagram,
    LinkedIn,
    YouTube,
    X,
  } from "@mui/icons-material";
  import "./Footer.css"; // ensure you have additional styling for .white-icon and .footer-section
  import { Box, IconButton, Typography, Grid } from "@mui/material";
  
  function Footer() {
    const currentYear = new Date().getFullYear();
  
    return (
      <div className="footer"
      >
        {/* Social icons */}
        <Grid container justifyContent="center" className="footer-section">
          <IconButton href="https://www.facebook.com/profile.php?id=61560548579807" target="_blank" color="info">
            <Facebook />
          </IconButton>
          <IconButton href="https://x.com/appsfortheworld" target="_blank" color="info">
            <X />
          </IconButton>
          <IconButton href="https://www.instagram.com/appsfortheworld" target="_blank" color="info">
            <Instagram />
          </IconButton>
          <IconButton href="https://www.linkedin.com/company/apps-for-the-world" target="_blank" color="info">
            <LinkedIn />
          </IconButton>
          <IconButton href="https://youtube.com" target="_blank" color="info">
            <YouTube />
          </IconButton>
        </Grid>
  
        <Box textAlign="center" py={2} className="footer-section">
          <Typography variant="body2">
            Explora más sobre <strong>Apps for the World</strong>
          </Typography>
          <Typography  variant="caption">
            <div style={{display: "flex", justifyContent: "center", fontSize: "1.2em", color: "gainsboro", margin: "10px 0"}}>
            <a style={{padding: "0 5px" , borderRight: "2px solid gainsboro", color: "gainsboro", textDecoration: "none"}} href="/politicadeprivacidad">Politica de privacidad</a>
            <a style={{padding: "0 5px" , borderRight: "2px solid gainsboro", color: "gainsboro", textDecoration: "none"}} href="/terminosycondiciones">Terminos y condiciones</a>
            <a style={{padding: "0 5px", color: "gainsboro", textDecoration: "none"}} href="https://tecnotics.com/quienes-somos">Quienes somos</a>
            </div>
          </Typography>
        </Box>
  
        {/* Copyright */}
        <Typography variant="body2" align="center" className="footer-section">
          © {currentYear} Apps for the World. Todos los derechos reservados.
        </Typography>
      </div>
    );
  }
  
  export default Footer;