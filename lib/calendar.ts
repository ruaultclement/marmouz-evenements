// Fonction pour générer un événement iCal
export function generateICalEvent(options: {
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm (default 20:00)
  endTime?: string; // HH:mm (default 23:00)
}): string {
  const {
    title,
    description,
    location,
    startDate,
    startTime = "20:00",
    endTime = "23:00",
  } = options;

  // Convert date and time to iCal format (YYYYMMDDTHHmmss)
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const dateStr = startDate.replace(/-/g, "");
  const dtStart = `${dateStr}T${String(startHour).padStart(2, "0")}${String(startMin).padStart(2, "0")}00`;
  const dtEnd = `${dateStr}T${String(endHour).padStart(2, "0")}${String(endMin).padStart(2, "0")}00`;

  const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//La Guinguette des Marmouz//NONSGML Event//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:La Guinguette des Marmouz
X-WR-TIMEZONE:Europe/Paris
BEGIN:VEVENT
UID:${dateStr}-${title.replace(/\s/g, "-")}@laguinguettedesmarmouz.fr
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${title}
DESCRIPTION:${description.replace(/\n/g, "\\n")}
LOCATION:${location}
STATUS:CONFIRMED
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Rappel - ${title}
TRIGGER:-P2D
END:VALARM
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Rappel - ${title}
TRIGGER:-PT5H40M
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return icalContent;
}

function toUtcDateTime(date: string, time = "20:00") {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  return utc.toISOString().replace(/[-:]/g, "").replace(".000", "");
}

function toGoogleDates(startDate: string, startTime = "20:00", endTime = "23:00") {
  const start = toUtcDateTime(startDate, startTime);
  const end = toUtcDateTime(startDate, endTime);
  return `${start}/${end}`;
}

// Fonction pour télécharger un fichier iCal
export function downloadICalFile(icalContent: string, filename: string = "event.ics") {
  const blob = new Blob([icalContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Fonction pour créer une URL Apple Calendar
export function generateAppleCalendarUrl(options: {
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm (default 20:00)
  endTime?: string; // HH:mm (default 23:00)
}): string {
  const { title, description, location, startDate } = options;
  const icalContent = generateICalEvent(options);
  const encoded = encodeURIComponent(icalContent);
  return `data:text/calendar;charset=utf-8,${encoded}`;
}

// Export calendar links for all platforms
export function getCalendarLinks(options: {
  title: string;
  description: string;
  location: string;
  startDate: string;
  startTime?: string;
  endTime?: string;
}) {
  const {
    title,
    description,
    location,
    startDate,
    startTime = "20:00",
    endTime = "23:00",
  } = options;

  const googleTitle = encodeURIComponent(title);
  const googleDesc = encodeURIComponent(description);
  const googleLoc = encodeURIComponent(location);
  const dates = toGoogleDates(startDate, startTime, endTime);

  const outlookStart = encodeURIComponent(`${startDate}T${startTime}:00`);
  const outlookEnd = encodeURIComponent(`${startDate}T${endTime}:00`);

  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${googleTitle}&details=${googleDesc}&location=${googleLoc}&dates=${dates}&ctz=Europe/Paris`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&subject=${googleTitle}&body=${googleDesc}&location=${googleLoc}&startdt=${outlookStart}&enddt=${outlookEnd}`,
    ical: {
      content: generateICalEvent({
        title,
        description,
        location,
        startDate,
        startTime,
        endTime,
      }),
      filename: `${startDate}-${title.replace(/\s+/g, "-")}.ics`,
    },
  };
}

export function generateICalCalendar(
  events: Array<{
    title: string;
    description: string;
    location: string;
    startDate: string;
    startTime?: string;
    endTime?: string;
  }>
) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//La Guinguette des Marmouz//NONSGML Event//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:La Guinguette des Marmouz",
    "X-WR-TIMEZONE:Europe/Paris",
  ];

  for (const event of events) {
    const startTime = event.startTime || "20:00";
    const endTime = event.endTime || "23:00";
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const dateStr = event.startDate.replace(/-/g, "");
    const dtStart = `${dateStr}T${String(startHour).padStart(2, "0")}${String(startMin).padStart(2, "0")}00`;
    const dtEnd = `${dateStr}T${String(endHour).padStart(2, "0")}${String(endMin).padStart(2, "0")}00`;

    lines.push(
      "BEGIN:VEVENT",
      `UID:${dateStr}-${event.title.replace(/\s/g, "-")}@laguinguettedesmarmouz.fr`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
      `LOCATION:${event.location}`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:Rappel - ${event.title}`,
      "TRIGGER:-P2D",
      "END:VALARM",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:Rappel - ${event.title}`,
      "TRIGGER:-PT5H40M",
      "END:VALARM",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\n");
}
