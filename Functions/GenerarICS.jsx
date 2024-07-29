import { createEvent } from "ics";
import moment from "moment-timezone";

const generateICSFile = (fecha, hora) => {
    try {
        const monthNames = [
            "enero",
            "febrero",
            "marzo",
            "abril",
            "mayo",
            "junio",
            "julio",
            "agosto",
            "septiembre",
            "octubre",
            "noviembre",
            "diciembre",
        ];

        const matchResult = fecha.match(/(\d+) de (\w+)/);
        if (!matchResult) {
            console.error("Formato de fecha no válido");
            return null;
        }

        const [, day, monthStr] = matchResult;
        const month = monthNames.indexOf(monthStr.toLowerCase()) + 1;

        const matchHora = hora.match(/(\d+):(\d+) (\w+)/);
        if (!matchHora) {
            console.error("Formato de hora no válido");
            return null;
        }

        const [, hour, minutes, ampm] = matchHora;
        let hour24 = parseInt(hour, 10);
        if (ampm.toLowerCase() === "pm" && hour24 !== 12) {
            hour24 += 12;
        }

        const startDate = moment(
            `${day}-${month}-${new Date().getFullYear()} ${hour24}:${minutes}`,
            "DD-MM-YYYY HH:mm"
        ).tz("America/Bogota");

        const event = {
            start: [
                startDate.year(),
                startDate.month() + 1,
                startDate.date(),
                startDate.hour(),
                startDate.minute(),
            ],
            end: [
                startDate.year(),
                startDate.month() + 1,
                startDate.date(),
                startDate.hour(),
                startDate.minute(),
            ],
            title: "AGENDA DE CITA",
            description: "Agrega esta cita a tu calendario para recibir recordatorios",
        };

        const { error, value } = createEvent(event);

        if (!error) {
            return value;
        } else {
            console.error("Error al construir el evento ICS:", error);
            return null;
        }
    } catch (error) {
        console.error("Error durante la creación del evento ICS:", error);
        return null;
    }
};

export default generateICSFile;