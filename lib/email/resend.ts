import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined in environment variables");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Default from email
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "VendX <[email protected]>";

// Specific from emails for different templates
export const WELCOME_EMAIL =
  process.env.NEXT_RESEND_WELCOME_EMAIL || "VendX <[email protected]>";

export const ORDER_CONFIRMATION_EMAIL =
  process.env.NEXT_RESEND_ORDER_CONFIRMATION_EMAIL || "VendX <[email protected]>";

export const RESET_PASSWORD_EMAIL =
  process.env.NEXT_RESEND_RESET_PASSWORD_EMAIL || "VendX <[email protected]>";

export const PAYMENT_RECEIVED_EMAIL =
  process.env.NEXT_RESEND_PAYMENT_RECEIVED_EMAIL || "VendX <[email protected]>";

