import { Text, Button, Section } from "@react-email/components";
import * as React from "react";
import { BaseTemplate } from "./base-template";

interface WelcomeEmailProps {
  name: string;
  email: string;
  profileUrl: string;
}

export const WelcomeEmail = ({
  name,
  email,
  profileUrl,
}: WelcomeEmailProps) => {
  return (
    <BaseTemplate preview="Welcome to VendX! Complete your profile to get started.">
      <Text
        className="dark-mode-text"
        style={{
          fontSize: "24px",
          fontWeight: "600",
          color: "#171717",
          margin: "0 0 16px 0",
        }}
      >
        Welcome to VendX, {name || "there"}! 👋
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
        We're excited to have you join our multi-vendor marketplace! You've
        successfully created your account with <strong>{email}</strong>.
      </Text>

      <Section
        className="dark-mode-card dark-mode-border"
        style={{
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e5e5",
          borderRadius: "8px",
          padding: "24px",
          margin: "0 0 24px 0",
        }}
      >
        <Text
          className="dark-mode-text"
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#171717",
            margin: "0 0 12px 0",
          }}
        >
          🚀 Next Steps
        </Text>
        <Text
          className="dark-mode-text"
          style={{
            fontSize: "14px",
            color: "#404040",
            lineHeight: "20px",
            margin: "0 0 8px 0",
          }}
        >
          • Complete your profile with your name and photo
        </Text>
        <Text
          className="dark-mode-text"
          style={{
            fontSize: "14px",
            color: "#404040",
            lineHeight: "20px",
            margin: "0 0 8px 0",
          }}
        >
          • Browse thousands of products from verified vendors
        </Text>
        <Text
          className="dark-mode-text"
          style={{
            fontSize: "14px",
            color: "#404040",
            lineHeight: "20px",
            margin: "0",
          }}
        >
          • Start shopping with secure cryptocurrency payments
        </Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button
          href={profileUrl}
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
          Complete Your Profile
        </Button>
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
        Need help getting started? Check out our{" "}
        <a
          href={`${process.env.NEXT_PUBLIC_BASE_URL || "https://vendx.store"}/help`}
          style={{ color: "#667eea", textDecoration: "none" }}
        >
          Help Center
        </a>{" "}
        or reply to this email.
      </Text>
    </BaseTemplate>
  );
};

export default WelcomeEmail;
