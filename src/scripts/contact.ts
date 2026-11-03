
const form = document.querySelector<HTMLFormElement>("form[data-contact]");

if (form) {
  type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  const submit = form.querySelector<HTMLButtonElement>("[data-submit]")!;
  const submitLabel = submit.querySelector<HTMLElement>("[data-label]")!;
  const alertBox = form.querySelector<HTMLElement>("[data-alert]")!;
  const status = form.querySelector<HTMLElement>("[data-status]")!;
  const success = document.querySelector<HTMLElement>("[data-success]")!;
  const successHeading = success.querySelector<HTMLElement>("[data-success-heading]")!;
  const successText = success.querySelector<HTMLElement>("[data-success-text]")!;
  const typeField = form.querySelector<HTMLSelectElement>("select[name=service]")!;
  // The page's own email link doubles as the fallback in error messages.
  const fallbackEmail = document.querySelector<HTMLAnchorElement>("a[data-contact-email]")?.href;

  const fields = Array.from(form.querySelectorAll<Field>("input[required], select[required], textarea[required]"));
  const requiredMessages: Record<string, string> = {
    name: "Enter your name.",
    email: "Enter your email address.",
    service: "Choose a project type.",
    message: "Write a short message.",
  };

  // The browser's own bubbles are replaced by inline messages below.
  form.noValidate = true;
  let sending = false;

  const turnstile = createTurnstile(form);
  // Load the spam check only when someone is likely to write.
  const near = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      near.disconnect();
      turnstile.load();
    },
    { rootMargin: "600px 0px" },
  );
  near.observe(form);
  form.addEventListener("focusin", () => turnstile.load(), { once: true });

  function problemWith(field: Field): string {
    const value = field.value.trim();
    if (!value) return requiredMessages[field.name] ?? "This field is required.";
    if (field.type === "email" && field.validity.typeMismatch) return "Enter an email address like name@example.com.";
    if ("minLength" in field && field.minLength > 0 && value.length < field.minLength) {
      return `Write at least ${field.minLength} characters.`;
    }
    return "";
  }

  function showFieldError(field: Field, message: string) {
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
    field.addEventListener(field instanceof HTMLSelectElement ? "change" : "input", () => {
      if (field.getAttribute("aria-invalid") === "true") showFieldError(field, problemWith(field));
    });
  }

  const asSentence = (text: string) => (/[.!?]$/.test(text) ? text : `${text}.`);

  function showAlert(message: string) {
    alertBox.replaceChildren();
    const p = document.createElement("p");
    p.append(`${message} `);
    if (fallbackEmail) {
      const link = document.createElement("a");
      link.href = fallbackEmail;
      link.textContent = fallbackEmail.replace("mailto:", "");
      p.append("You can also email ", link, ".");
    }
    alertBox.append(p);
  }

  function setSending(value: boolean) {
    sending = value;
    submit.setAttribute("aria-disabled", String(value));
    submit.toggleAttribute("aria-busy", value);
    submitLabel.textContent = value ? "Sending…" : "Send message";
    status.textContent = value ? "Sending your message" : "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;
    alertBox.replaceChildren();

    let firstInvalid: Field | null = null;
    for (const field of fields) {
      const problem = problemWith(field);
      showFieldError(field, problem);
      if (problem && !firstInvalid) firstInvalid = field;
    }
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const name = data.name.trim();
    const replyTo = data.email.trim();

    setSending(true);
    try {
      const token = await turnstile.token();
      if (!token) {
        showAlert("The spam check could not load. Turn off any blocker for this page and try again.");
        return;
      }
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...data, "cf-turnstile-response": token }),
      });
      const result: { ok?: boolean; error?: string; fields?: Record<string, string> } = await response
        .json()
        .catch(() => ({}));
      // A token works once, so every attempt gets a fresh one.
      turnstile.reset();

      if (response.ok && result.ok) {
        successText.textContent = `Thanks, ${name}. Your message is on its way. We reply to ${replyTo} within one working day.`;
        form.reset();
        form.hidden = true;
        success.hidden = false;
        successHeading.focus();
      } else {
        let first: Field | null = null;
        for (const field of fields) {
          const problem = result.fields?.[field.name];
          if (!problem) continue;
          showFieldError(field, problem);
          first ??= field;
        }
        if (first) first.focus();
        else showAlert(result.error ? asSentence(result.error) : "Your message could not be sent.");
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

  // Focus waits for the smooth scroll to land. Phones skip it so the
  // keyboard does not jump up over the form.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll<HTMLAnchorElement>("a[data-msg]").forEach((link) =>
    link.addEventListener("click", () => {
      const type = link.dataset.type;
      if (type && !form.hidden) {
        typeField.value = type;
        showFieldError(typeField, "");
      }
      if (!window.matchMedia("(pointer: fine)").matches) return;
      const target: HTMLElement = form.hidden
        ? success.querySelector<HTMLElement>("[data-send-another]")!
        : (fields.find((f) => !f.value.trim()) ?? fields[0]);
      window.setTimeout(() => target.focus({ preventScroll: true }), reduceMotion ? 0 : 650);
    }),
  );
}

interface TurnstileApi {
  render(el: HTMLElement, options: Record<string, unknown>): string;
  reset(id: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

// With "interaction-only", Turnstile stays invisible unless Cloudflare needs
// the visitor to click a checkbox.
function createTurnstile(form: HTMLFormElement) {
  const box = form.querySelector<HTMLElement>("[data-turnstile]")!;
  const sitekey = form.dataset.sitekey!;
  let widget: string | null = null;
  let current = "";
  let waiting: ((token: string) => void)[] = [];
  let loading: Promise<void> | null = null;

  const settle = (token: string) => {
    current = token;
    waiting.forEach((resolve) => resolve(token));
    waiting = [];
  };

  function load() {
    loading ??= new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("turnstile script blocked"));
      document.head.append(script);
    }).then(() => {
      widget = window.turnstile!.render(box, {
        sitekey,
        action: "contact",
        appearance: "interaction-only",
        callback: settle,
        "expired-callback": () => (current = ""),
        "error-callback": () => settle(""),
      });
    });
    return loading;
  }

  return {
    load: () => void load().catch(() => settle("")),
    /** Resolves with a token, or an empty string if the check cannot run. */
    async token(): Promise<string> {
      try {
        await load();
      } catch {
        return "";
      }
      if (current) return current;
      return new Promise((resolve) => {
        waiting.push(resolve);
        window.setTimeout(() => resolve(current), 30_000);
      });
    },
    reset() {
      current = "";
      if (widget && window.turnstile) window.turnstile.reset(widget);
    },
  };
}

export {};
