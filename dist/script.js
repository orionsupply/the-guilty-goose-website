const form = document.querySelector("#signup-form");
const note = document.querySelector("#form-note");
const eventsList = document.querySelector("#events-list");
const eventsCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSPdQIiWVq-aw4bAbPij5gVyrszYU5fFAFJ7YJ1CjAINH1h1EHB8b4KXSjXST-pHHdYQody_a8b19A4/pub?gid=1665960344&single=true&output=csv";

const fallbackEvents = [
  {
    Date: "2026-10-02",
    Time: "7:30 PM",
    "Artist / Event": "Friday Night Patio Session",
    Description: "Local acoustic set with interview clips coming soon.",
    Cover: "No cover",
    "Location / Age Notes": "21+ after 9 PM",
    Facebook: "https://www.facebook.com/theguiltygoose",
    Status: "Published",
  },
  {
    Date: "2026-10-10",
    Time: "8:00 PM",
    "Artist / Event": "Saturday House Band",
    Description: "Full-band set, drink specials, and a short pre-show Q&A.",
    Cover: "$5 cover",
    "Location / Age Notes": "Inside stage",
    Facebook: "https://www.facebook.com/theguiltygoose",
    Status: "Published",
  },
];

form?.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  const email = String(data.get("email") || "").trim();
  const phone = String(data.get("phone") || "").trim();

  if (!email && !phone) {
    note.textContent = "Add an email or phone number so we know where to send show updates.";
    note.classList.add("is-error");
    return;
  }

  note.classList.remove("is-error");
  note.textContent = "You're on the list. Once the signup service is connected, this will send straight to The Guilty Goose.";
  form.reset();
});

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);

  const headers = rows.shift()?.map((header) => header.trim()) || [];
  return rows.map((cells) =>
    headers.reduce((record, header, index) => {
      record[header] = (cells[index] || "").trim();
      return record;
    }, {})
  );
}

function formatEventDate(dateText) {
  const date = new Date(`${dateText}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return { month: "Date", day: "TBD", iso: "" };
  }

  return {
    month: date.toLocaleString("en-US", { month: "short" }),
    day: String(date.getDate()).padStart(2, "0"),
    iso: dateText,
  };
}

function linkFor(label, url) {
  if (!url || url === "#") return "";
  return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

function eventCard(event) {
  const date = formatEventDate(event.Date);
  const links = [
    linkFor("Website", event.Website),
    linkFor("Facebook", event.Facebook),
    linkFor("YouTube", event.YouTube),
    linkFor("TikTok", event.TikTok),
  ].filter(Boolean);

  return `
    <article class="show-card">
      <time ${date.iso ? `datetime="${date.iso}"` : ""}>
        <span>${date.month}</span>
        <strong>${date.day}</strong>
      </time>
      <div>
        <h3>${event["Artist / Event"] || "Event TBA"}</h3>
        <p>${event.Description || ""}</p>
        <div class="meta-row">
          ${event.Time ? `<span>${event.Time}</span>` : ""}
          ${event.Cover ? `<span>${event.Cover}</span>` : ""}
          ${event["Location / Age Notes"] ? `<span>${event["Location / Age Notes"]}</span>` : ""}
        </div>
        ${links.length ? `<div class="link-row" aria-label="Artist links">${links.join("")}</div>` : ""}
      </div>
    </article>
  `;
}

function renderEvents(events) {
  const published = events
    .filter((event) => (event.Status || "").toLowerCase() === "published")
    .sort((a, b) => String(a.Date).localeCompare(String(b.Date)));

  if (!eventsList) return;

  if (!published.length) {
    eventsList.innerHTML = `<p class="form-note">No published events yet. Add rows in the calendar sheet and mark them Published.</p>`;
    return;
  }

  eventsList.innerHTML = published.map(eventCard).join("");
}

async function loadEvents() {
  if (!eventsList) return;

  try {
    const response = await fetch(eventsCsvUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Event calendar is not published yet.");
    }

    renderEvents(parseCsv(await response.text()));
  } catch {
    renderEvents(fallbackEvents);
  }
}

loadEvents();
