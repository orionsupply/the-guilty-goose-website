const form = document.querySelector("#signup-form");
const note = document.querySelector("#form-note");

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
