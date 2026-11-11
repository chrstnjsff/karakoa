import { calendlyUrl, contact, whatsappUrl } from "../data/site";

const form = document.querySelector<HTMLFormElement>("form[data-contact]");

if (form) {
  type Field = HTMLInputElement | HTMLTextAreaElement;

  const submit = form.querySelector<HTMLButtonElement>("[data-submit]")!;
  const submitLabel = submit.querySelector<HTMLElement>("[data-label]")!;
  const back = form.querySelector<HTMLButtonElement>("[data-back]")!;
  const alertBox = form.querySelector<HTMLElement>("[data-alert]")!;
  const status = form.querySelector<HTMLElement>("[data-status]")!;
  const success = document.querySelector<HTMLElement>("[data-success]")!;
  const successHeading = success.querySelector<HTMLElement>("[data-success-heading]")!;
  const successText = success.querySelector<HTMLElement>("[data-success-text]")!;
  const waLink = success.querySelector<HTMLAnchorElement>("[data-whatsapp]")!;
  const callLink = success.querySelector<HTMLAnchorElement>("[data-call]")!;
  const steps = [...form.querySelectorAll<HTMLFieldSetElement>("fieldset[data-step]")];
  const last = steps.length - 1;
  // The page's own email link doubles as the fallback in error messages.
  const fallbackEmail = document.querySelector<HTMLAnchorElement>("a[data-contact-email]")?.href;

  // Name and email: the radios are checked per step.
  const fields = Array.from(form.querySelectorAll<Field>("input[required]:not([type=radio])"));
  const requiredMessages: Record<string, string> = {
    name: "Enter your name.",
    email: "Enter your email address.",
  };
  const choiceErrors: Record<string, string> = {
    service: contact.need.error,
    timeline: contact.start.error,
  };

  // The browser's own bubbles are replaced by inline messages below.
  form.noValidate = true;
  form.setAttribute("data-stepped", "");
  let sending = false;
  let step = 0;
  let pending = 0;
  let tapped = false;

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

  function showChoiceError(fieldset: HTMLFieldSetElement, message: string) {
    const error = document.getElementById(`${fieldset.id}-error`)!;
    fieldset.toggleAttribute("data-invalid", !!message);
    error.textContent = message;
    error.hidden = !message;
  }

  function checkChoice(fieldset: HTMLFieldSetElement): boolean {
    const chosen = (form!.elements.namedItem(fieldset.dataset.name!) as RadioNodeList).value;
    showChoiceError(fieldset, chosen ? "" : choiceErrors[fieldset.dataset.name!]);
    return !!chosen;
  }

  /** Flags what is wrong on step `i` and returns the control to focus, or null when it is fine. */
  function stepProblem(i: number): HTMLElement | null {
    const fieldset = steps[i];
    if (fieldset.dataset.name) return checkChoice(fieldset) ? null : fieldset.querySelector<HTMLElement>("input");
    let firstInvalid: Field | null = null;
    for (const field of fields) {
      const problem = problemWith(field);
      showFieldError(field, problem);
      if (problem && !firstInvalid) firstInvalid = field;
    }
    return firstInvalid;
  }

  function showStep(i: number, focus = true) {
    step = i;
    steps.forEach((fieldset, n) => (fieldset.hidden = n !== i));
    back.hidden = i === 0;
    submitLabel.textContent = i < last ? contact.next : contact.send;
    alertBox.replaceChildren();
    if (focus) steps[i].querySelector<HTMLElement>("legend")!.focus();
  }

  function next() {
    const problem = stepProblem(step);
    if (problem) problem.focus();
    else showStep(step + 1);
  }

  showStep(0, false);

  // Once a field has been flagged, clear the error as soon as it is fixed.
  for (const field of fields) {
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") showFieldError(field, problemWith(field));
    });
  }

  // A tap or click on an answer moves on after a beat. The keyboard never
  // does, so arrow keys can browse the options; Next always works.
  for (const fieldset of steps.filter((f) => f.dataset.name)) {
    fieldset.addEventListener("pointerdown", () => (tapped = true));
    fieldset.addEventListener("keydown", () => (tapped = false));
    fieldset.addEventListener("click", (event) => {
      if (!tapped || !(event.target instanceof HTMLInputElement) || event.target.type !== "radio") return;
      tapped = false;
      const at = step;
      pending = window.setTimeout(() => {
        if (step === at) next();
      }, 150);
    });
    fieldset.addEventListener("change", () => {
      if (fieldset.hasAttribute("data-invalid")) checkChoice(fieldset);
    });
  }

  back.addEventListener("click", () => {
    clearTimeout(pending);
    showStep(step - 1);
  });

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
    submitLabel.textContent = value ? "Sending…" : contact.send;
    status.textContent = value ? "Sending your message" : "";
  }

  const stepOf = (control: HTMLElement) => steps.indexOf(control.closest<HTMLFieldSetElement>("fieldset[data-step]")!);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;
    if (step < last) return next();
    alertBox.replaceChildren();

    for (let i = 0; i <= last; i++) {
      const problem = stepProblem(i);
      if (!problem) continue;
      showStep(i, false);
      problem.focus();
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
        successText.textContent = contact.success.text(name, replyTo);
        waLink.href = `${whatsappUrl}?text=${encodeURIComponent(
          contact.success.whatsappText({ name, service: data.service, timeline: data.timeline }),
        )}`;
        callLink.href = `${calendlyUrl}?name=${encodeURIComponent(name)}&email=${encodeURIComponent(replyTo)}`;
        form.reset();
        showStep(0, false);
        form.hidden = true;
        success.hidden = false;
        successHeading.focus();
      } else {
        // Send the visitor to the earliest step that holds a refused field.
        let target: HTMLElement | null = null;
        for (const [key, message] of Object.entries(result.fields ?? {})) {
          const control = form.elements.namedItem(key);
          let focusable: HTMLElement;
          if (control instanceof RadioNodeList) {
            const fieldset = form.querySelector<HTMLFieldSetElement>(`fieldset[data-name="${key}"]`)!;
            showChoiceError(fieldset, message);
            focusable = fieldset.querySelector<HTMLElement>("input:checked") ?? fieldset.querySelector<HTMLElement>("input")!;
          } else if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) {
            showFieldError(control, message);
            focusable = control;
          } else continue;
          if (!target || stepOf(focusable) < stepOf(target)) target = focusable;
        }
        if (target) {
          showStep(stepOf(target), false);
          target.focus();
        } else showAlert(result.error ? asSentence(result.error) : "Your message could not be sent.");
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
    showStep(0);
  });

  // Focus waits for the smooth scroll to land. Phones skip it so the
  // keyboard does not jump up over the form.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll<HTMLAnchorElement>("a[data-msg]").forEach((link) =>
    link.addEventListener("click", () => {
      const type = link.dataset.type;
      if (type && !form.hidden) {
        const radio = form.querySelector<HTMLInputElement>(`input[name=service][value="${CSS.escape(type)}"]`);
        if (radio) radio.checked = true;
        showChoiceError(steps[0], "");
        showStep(0, false);
      }
      if (!window.matchMedia("(pointer: fine)").matches) return;
      const current = steps[step];
      const target: HTMLElement = form.hidden
        ? success.querySelector<HTMLElement>("[data-send-another]")!
        : (current.querySelector<HTMLElement>("input:checked") ??
          (step === last ? fields.find((f) => !f.value.trim()) : undefined) ??
          current.querySelector<HTMLElement>("input"))!;
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
