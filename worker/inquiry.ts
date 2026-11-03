import { contact } from "../src/data/site";

export interface Inquiry {
  name: string;
  email: string;
  service: string;
  message: string;
}

export type FieldErrors = Partial<Record<keyof Inquiry, string>>;

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;
// Header fields must stay on one line, or a value could add headers of its own.
const LINE_BREAK = /[\r\n]/;

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export function validate(input: Record<string, unknown>): { inquiry: Inquiry } | { errors: FieldErrors } {
  const inquiry: Inquiry = {
    name: text(input.name),
    email: text(input.email),
    service: text(input.service),
    message: text(input.message),
  };
  const errors: FieldErrors = {};

  if (!inquiry.name) errors.name = "Enter your name.";
  else if (inquiry.name.length > 100 || LINE_BREAK.test(inquiry.name)) errors.name = "Enter a shorter name, on one line.";

  if (!inquiry.email) errors.email = "Enter your email address.";
  else if (inquiry.email.length > 254 || !EMAIL.test(inquiry.email)) errors.email = "Enter an email address like name@example.com.";

  if (!contact.projectTypes.includes(inquiry.service)) errors.service = "Choose a project type.";

  if (!inquiry.message) errors.message = "Write a short message.";
  else if (inquiry.message.length < 10) errors.message = "Write at least 10 characters.";
  else if (inquiry.message.length > 5000) errors.message = "Keep the message under 5,000 characters.";

  return Object.keys(errors).length ? { errors } : { inquiry };
}

const manila = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  dateStyle: "medium",
  timeStyle: "short",
});

export function notification(inquiry: Inquiry, received: Date) {
  return {
    subject: `[Karakoa] ${inquiry.service}: ${inquiry.name}`,
    text: [
      "New message from the karakoa.dev contact form.",
      "",
      `Name: ${inquiry.name}`,
      `Email: ${inquiry.email}`,
      `Project type: ${inquiry.service}`,
      `Received: ${manila.format(received)} Manila time (${received.toISOString()})`,
      "",
      "Message:",
      inquiry.message,
      "",
      `Reply to this email to answer ${inquiry.name} directly.`,
    ].join("\n"),
  };
}
