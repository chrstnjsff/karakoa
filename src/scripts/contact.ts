// Enhances the Web3Forms inquiry form (see ContactForm.astro):
// inline, accessible validation, a JSON submit with clear states, and a
// success panel. Without this script the form still posts natively.

const form = document.querySelector<HTMLFormElement>("form[data-contact]");

if (form) {
  const submit = form.querySelector<HTMLButtonElement>("[data-submit]")!;
  const alertBox = document.getElementById("contact-alert")!;
  const status = document.getElementById("contact-status")!;
  const success = document.getElementById("contact-success")!;
  const successHeading = success.querySelector<HTMLElement>("[data-success-heading]")!;
  const successText = success.querySelector<HTMLElement>("[data-success-text]")!;
  // The page's own email link doubles as the fallback in error messages.
  const fallbackEmail = document.querySelector<HTMLAnchorElement>("a[data-contact-email]")?.href;

  const fields = Array.from(
    form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[required], textarea[required]"),
  );
  const requiredMessages: Record<string, string> = {
    name: "Enter your name.",
    email: "Enter your email address.",
    message: "Write a message.",
  };

  // The browser's own bubbles are replaced by inline messages below.
  form.noValidate = true;
  let sending = false;

  function problemWith(field: HTMLInputElement | HTMLTextAreaElement): string {
    const value = field.value.trim();
    if (!value) return requiredMessages[field.name] ?? "This field is required.";
    if (field.type === "email" && field.validity.typeMismatch) {
      return "Enter an email address like name@example.com.";
    }
    if (field.minLength > 0 && value.length < field.minLength) {
      return `Write at least ${field.minLength} characters.`;
    }
    return "";
  }

  function showFieldError(field: HTMLInputElement | HTMLTextAreaElement, message: string) {
    const error = document.getElementById(`${field.id}-error`);
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
    if (error) {
      error.textContent = message;
      error.hidden = !message;
    }
  }

  // Once a field has been flagged, clear the error as soon as it is fixed.
  for (const field of fields) {
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") showFieldError(field, problemWith(field));
    });
  }

  const asSentence = (text: string) => (/[.!?]$/.test(text) ? text : `${text}.`);

  function showAlert(message: string) {
    alertBox.replaceChildren();
    const p = document.createElement("p");
    p.append(`${message} `);
    if (fallbackEmail) {
      p.append("You can also email us at ");
      const link = document.createElement("a");
      link.href = fallbackEmail;
      link.className = "link-ul text-ink";
      link.textContent = fallbackEmail.replace("mailto:", "");
      p.append(link, ".");
    }
    alertBox.append(p);
  }

  function setSending(value: boolean) {
    sending = value;
    submit.setAttribute("aria-disabled", String(value));
    submit.toggleAttribute("aria-busy", value);
    submit.textContent = value ? "Sending…" : "Send project inquiry";
    status.textContent = value ? "Sending your message" : "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;
    alertBox.replaceChildren();

    let firstInvalid: HTMLElement | null = null;
    for (const field of fields) {
      const problem = problemWith(field);
      showFieldError(field, problem);
      if (problem && !firstInvalid) firstInvalid = field;
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    if (form.dataset.captcha === "hcaptcha") {
      const token = form.querySelector<HTMLTextAreaElement>('[name="h-captcha-response"]')?.value;
      if (!token) {
        showAlert("Complete the spam check, then send again.");
        return;
      }
    }

    const data = new FormData(form);
    // `redirect` is for the no-JS path only; sent from fetch it makes
    // Web3Forms answer with a redirect that fails CORS.
    data.delete("redirect");
    const name = String(data.get("name") ?? "").trim();
    const replyTo = String(data.get("email") ?? "").trim();
    data.set("subject", `[Karakoa] ${data.get("service")}: ${name}`);

    setSending(true);
    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      });
      const result: { success?: boolean; message?: string } = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        successText.textContent = `Thanks, ${name}. Your inquiry is on its way. We reply to ${replyTo} within one working day.`;
        form.reset();
        form.hidden = true;
        success.hidden = false;
        successHeading.focus();
      } else if (response.status === 429) {
        showAlert("Too many messages in a short time. Wait a minute and try again.");
      } else {
        showAlert(result.message ? asSentence(result.message) : "Your message could not be sent.");
      }
    } catch {
      showAlert("Your message could not be sent. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  });

  success.querySelector("[data-send-another]")?.addEventListener("click", () => {
    success.hidden = true;
    form.hidden = false;
    fields[0]?.focus();
  });
}

export {};
