import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Img,
  Text,
  Link,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface BaseTemplateProps {
  preview: string;
  children: React.ReactNode;
}

export const BaseTemplate = ({ preview, children }: BaseTemplateProps) => {
  return (
    <Html>
      <Head>
        <style>{`
          @media (prefers-color-scheme: dark) {
            .dark-mode-bg {
              background-color: #1a1a1a !important;
            }
            .dark-mode-text {
              color: #e5e5e5 !important;
            }
            .dark-mode-text-muted {
              color: #a3a3a3 !important;
            }
            .dark-mode-border {
              border-color: #404040 !important;
            }
            .dark-mode-card {
              background-color: #262626 !important;
            }
          }
        `}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        className="dark-mode-bg"
        style={{
          backgroundColor: "#f5f5f5",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          padding: "40px 20px",
        }}
      >
        <Container
          className="dark-mode-card"
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            maxWidth: "600px",
            margin: "0 auto",
            padding: "0",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Header */}
          <Section
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              padding: "40px 40px 32px 40px",
              borderRadius: "12px 12px 0 0",
              textAlign: "center",
            }}
          >
            {/* Logo Icon - Using data URI for the SVG */}
            <Img
              src="data:image/svg+xml,%3csvg width='45' height='48' viewBox='0 0 45 48' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M2.66886 3.99136C2.2322 4.8618 2.01745 5.93559 1.58793 8.08317L0.145789 15.2939C-0.767344 19.8596 2.72479 24.1193 7.3809 24.1193C11.1716 24.1193 14.3455 21.2469 14.7227 17.4751L14.8891 15.8106C14.4958 20.2694 18.0102 24.1193 22.4995 24.1193C27.0192 24.1193 30.551 20.2168 30.1012 15.7194L30.2772 17.4751C30.6545 21.2469 33.8283 24.1193 37.6191 24.1193C42.2751 24.1193 45.7674 19.8596 44.8542 15.2939L43.4121 8.08317C42.9826 5.93564 42.7676 4.8618 42.3311 3.99136C41.4109 2.15721 39.7554 0.799989 37.7764 0.257473C36.8372 3.59405e-08 35.7422 0 33.5521 0H28.5293H11.4478C9.25772 0 8.16266 3.59405e-08 7.22348 0.257473C5.24451 0.799989 3.58894 2.15721 2.66886 3.99136Z' fill='%23ffffff'/%3e%3cpath d='M37.2564 28.0107C39.18 28.0107 40.9672 27.5106 42.5096 26.6427V29.1877C42.5096 38.0654 42.5096 42.5042 39.7515 45.2623C37.5314 47.4824 34.2223 47.9153 28.3851 47.9998V39.7811C28.3851 37.5809 28.3851 36.4809 27.9119 35.6614C27.6021 35.1247 27.1563 34.6788 26.6195 34.369C25.8001 33.8959 24.7 33.8959 22.4999 33.8959C20.2998 33.8959 19.1997 33.8959 18.3803 34.369C17.8435 34.6788 17.3977 35.1247 17.0878 35.6614C16.6147 36.4809 16.6147 37.5809 16.6147 39.7811V47.9998C10.7776 47.9153 7.46831 47.4824 5.2482 45.2623C2.49023 42.5042 2.49023 38.0654 2.49023 29.1877V26.6427C4.03272 27.5106 5.81982 28.0107 7.74353 28.0107C10.5615 28.0107 13.1452 26.9193 15.0713 25.1196C17.0189 26.9092 19.6197 28.0107 22.4994 28.0107C25.3794 28.0107 27.9804 26.9089 29.9282 25.1191C31.8543 26.9191 34.4381 28.0107 37.2564 28.0107Z' fill='%23ffffff'/%3e%3c/svg%3e"
              alt="VendX Logo"
              width="45"
              height="48"
              style={{
                display: "block",
                margin: "0 auto 16px auto",
              }}
            />
            <Text
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                color: "#ffffff",
                margin: "0",
                letterSpacing: "-0.5px",
              }}
            >
              VendX
            </Text>
            <Text
              style={{
                fontSize: "15px",
                color: "rgba(255, 255, 255, 0.9)",
                margin: "8px 0 0 0",
                fontWeight: "400",
              }}
            >
              Your Multi-Vendor Marketplace
            </Text>
          </Section>

          {/* Content */}
          <Section style={{ padding: "40px" }}>{children}</Section>

          {/* Footer */}
          <Section
            className="dark-mode-border"
            style={{
              borderTop: "1px solid #e5e5e5",
              padding: "32px 40px",
            }}
          >
            <Text
              className="dark-mode-text-muted"
              style={{
                fontSize: "12px",
                color: "#737373",
                textAlign: "center",
                margin: "0 0 8px 0",
              }}
            >
              © {new Date().getFullYear()} VendX. All rights reserved.
            </Text>
            <Text
              className="dark-mode-text-muted"
              style={{
                fontSize: "12px",
                color: "#737373",
                textAlign: "center",
                margin: "0",
              }}
            >
              You're receiving this email because you have an account with
              VendX.
            </Text>
            <Text
              style={{
                fontSize: "12px",
                textAlign: "center",
                margin: "16px 0 0 0",
              }}
            >
              <Link
                href={`${process.env.NEXT_PUBLIC_BASE_URL || "https://vendx.store"}`}
                style={{
                  color: "#667eea",
                  textDecoration: "none",
                  marginRight: "16px",
                }}
              >
                Visit VendX
              </Link>
              <Link
                href={`${process.env.NEXT_PUBLIC_BASE_URL || "https://vendx.store"}/help`}
                style={{
                  color: "#667eea",
                  textDecoration: "none",
                }}
              >
                Help Center
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
