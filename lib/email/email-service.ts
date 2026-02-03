import {
  resend,
  WELCOME_EMAIL,
  ORDER_CONFIRMATION_EMAIL,
  RESET_PASSWORD_EMAIL,
  PAYMENT_RECEIVED_EMAIL,
} from "./resend";
import React from "react";
import WelcomeEmail from "./templates/welcome-email";
import PasswordResetEmail from "./templates/password-reset-email";
import OrderConfirmationEmail from "./templates/order-confirmation-email";
import PaymentReceivedEmail from "./templates/payment-received-email";

// Shared return type for all email functions
type EmailResult =
  | { success: true; data: any }
  | { success: false; error: unknown };

interface WelcomeEmailData {
  name: string;
  email: string;
  profileUrl: string;
}

interface PasswordResetEmailData {
  name: string;
  email: string;
  resetUrl: string;
  expiresIn: string;
}

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderConfirmationEmailData {
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  bchAmount: number;
  bchAddress: string;
  orderUrl: string;
  expiresAt: string; // ISO string — survives serialization
}

interface PaymentReceivedEmailData {
  orderId: string;
  vendorName: string;
  vendorEmail: string;
  buyerName: string;
  items: OrderItem[];
  totalAmount: number;
  bchAmount: number;
  dashboardUrl: string;
}

const isDev = process.env.NODE_ENV === "development";

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  data: WelcomeEmailData,
): Promise<EmailResult> {
  try {
    const result = await resend.emails.send({
      from: WELCOME_EMAIL,
      to: data.email,
      subject: "Welcome to VendX! 🎉",
      react: React.createElement(WelcomeEmail, data),
    });

    if (isDev) console.log("✅ Welcome email sent:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Failed to send welcome email:", error);
    return { success: false, error };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  data: PasswordResetEmailData,
): Promise<EmailResult> {
  try {
    const result = await resend.emails.send({
      from: RESET_PASSWORD_EMAIL,
      to: data.email,
      subject: "Reset Your VendX Password",
      react: React.createElement(PasswordResetEmail, data),
    });

    if (isDev) console.log("✅ Password reset email sent:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Failed to send password reset email:", error);
    return { success: false, error };
  }
}

/**
 * Send order confirmation email to buyer
 */
export async function sendOrderConfirmationEmail(
  data: OrderConfirmationEmailData,
): Promise<EmailResult> {
  try {
    const result = await resend.emails.send({
      from: ORDER_CONFIRMATION_EMAIL,
      to: data.buyerEmail,
      subject: `Order Confirmation - ${data.orderId}`,
      react: React.createElement(OrderConfirmationEmail, {
        ...data,
        expiresAt: new Date(data.expiresAt),
      }),
    });

    if (isDev) console.log("✅ Order confirmation email sent:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Failed to send order confirmation email:", error);
    return { success: false, error };
  }
}

/**
 * Send payment received email to vendor
 */
export async function sendPaymentReceivedEmail(
  data: PaymentReceivedEmailData,
): Promise<EmailResult> {
  try {
    const result = await resend.emails.send({
      from: PAYMENT_RECEIVED_EMAIL,
      to: data.vendorEmail,
      subject: `Payment Received - Order ${data.orderId}`,
      react: React.createElement(PaymentReceivedEmail, data),
    });

    if (isDev) console.log("✅ Payment received email sent:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("❌ Failed to send payment received email:", error);
    return { success: false, error };
  }
}