import { Text, Button, Section } from "@react-email/components";
import * as React from "react";
import { BaseTemplate } from "./base-template";

interface PasswordResetEmailProps {
  name: string;
  email: string;
  resetUrl: string;
  expiresIn: string;
}

export const PasswordResetEmail = ({
  name,
  email,
  resetUrl,
  expiresIn,
}: PasswordResetEmailProps) => {
  return (
    <BaseTemplate preview="Reset your VendX password">
      <Text
        className="dark-mode-text"
        style={{
          fontSize: "24px",
          fontWeight: "600",
          color: "#171717",
          margin: "0 0 16px 0",
        }}
      >
        Reset Your Password
      </Text>

      <Text
        className="dark-mode-text"
        style={{
          fontSize: "16px",
          color: "#404040",
          lineHeight: "24px",
          margin: "0 0 24px 0",
        }}
      >
        Hi {name || "there"}, we received a request to reset the password for
        your VendX account (<strong>{email}</strong>).
      </Text>

      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button
          href={resetUrl}
          style={{
            backgroundColor: "#667eea",
            color: "#ffffff",
            padding: "14px 32px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "16px",
            display: "inline-block",
            boxShadow: "0 2px 4px rgba(102, 126, 234, 0.3)",
          }}
        >
          Reset Password
        </Button>
      </Section>

      <Text
        className="dark-mode-text-muted"
        style={{
          fontSize: "14px",
          color: "#737373",
          textAlign: "center",
          margin: "0 0 24px 0",
        }}
      >
        This link will expire in {expiresIn}
      </Text>

      <Section
        style={{
          backgroundColor: "#fef3c7",
          border: "1px solid #fbbf24",
          borderRadius: "8px",
          padding: "16px",
          margin: "24px 0",
        }}
      >
        <Text
          style={{
            fontSize: "14px",
            color: "#92400e",
            lineHeight: "20px",
            margin: "0",
          }}
        >
          ⚠️ <strong>Security Notice:</strong> If you didn't request this
          password reset, please ignore this email or contact our support team
          if you have concerns about your account security.
        </Text>
      </Section>

      <Text
        className="dark-mode-text-muted"
        style={{
          fontSize: "14px",
          color: "#737373",
          lineHeight: "20px",
          margin: "24px 0 0 0",
        }}
      >
        If the button above doesn't work, copy and paste this link into your
        browser:
      </Text>
      <Text
        style={{
          fontSize: "12px",
          color: "#667eea",
          wordBreak: "break-all",
          margin: "8px 0 0 0",
        }}
      >
        {resetUrl}
      </Text>
    </BaseTemplate>
  );
};

export default PasswordResetEmail;
