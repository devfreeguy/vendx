import {
  Text,
  Button,
  Section,
  Row,
  Column,
  Hr,
} from "@react-email/components";
import * as React from "react";
import { BaseTemplate } from "./base-template";

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

interface PaymentReceivedEmailProps {
  orderId: string;
  vendorName: string;
  vendorEmail: string;
  buyerName: string;
  items: OrderItem[];
  totalAmount: number;
  bchAmount: number;
  dashboardUrl: string;
}

export const PaymentReceivedEmail = ({
  orderId,
  vendorName,
  vendorEmail,
  buyerName,
  items,
  totalAmount,
  bchAmount,
  dashboardUrl,
}: PaymentReceivedEmailProps) => {
  return (
    <BaseTemplate preview={`Payment Received - Order ${orderId}`}>
      <Text
        className="dark-mode-text"
        style={{
          fontSize: "24px",
          fontWeight: "600",
          color: "#171717",
          margin: "0 0 8px 0",
        }}
      >
        Payment Received! 💰
      </Text>

      <Text
        className="dark-mode-text-muted"
        style={{
          fontSize: "14px",
          color: "#737373",
          margin: "0 0 24px 0",
        }}
      >
        Order #{orderId}
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
        Great news, {vendorName || "there"}! Payment has been confirmed for an
        order containing your products. Time to prepare for shipment!
      </Text>

      {/* Payment Summary */}
      <Section
        style={{
          backgroundColor: "#d1fae5",
          border: "1px solid #34d399",
          borderRadius: "8px",
          padding: "20px",
          margin: "0 0 24px 0",
        }}
      >
        <Text
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#065f46",
            margin: "0 0 8px 0",
          }}
        >
          ✅ Payment Confirmed
        </Text>
        <Text
          style={{
            fontSize: "14px",
            color: "#047857",
            margin: "0",
          }}
        >
          Amount: <strong>{bchAmount.toFixed(8)} BCH</strong> (${totalAmount.toFixed(2)} USD)
        </Text>
      </Section>

      {/* Order Details */}
      <Section
        className="dark-mode-card dark-mode-border"
        style={{
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e5e5",
          borderRadius: "8px",
          padding: "20px",
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
          Order Details
        </Text>
        <Text
          className="dark-mode-text-muted"
          style={{
            fontSize: "14px",
            color: "#737373",
            margin: "0 0 16px 0",
          }}
        >
          Buyer: <strong>{buyerName}</strong>
        </Text>

        <Text
          className="dark-mode-text"
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#404040",
            margin: "0 0 12px 0",
          }}
        >
          Your Items:
        </Text>
        {items.map((item, index) => (
          <Section key={index} style={{ marginBottom: "12px" }}>
            <Row>
              <Column style={{ width: "70%" }}>
                <Text
                  className="dark-mode-text"
                  style={{
                    fontSize: "14px",
                    color: "#404040",
                    margin: "0",
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  className="dark-mode-text-muted"
                  style={{
                    fontSize: "12px",
                    color: "#737373",
                    margin: "4px 0 0 0",
                  }}
                >
                  Qty: {item.quantity}
                </Text>
              </Column>
              <Column style={{ width: "30%", textAlign: "right" }}>
                <Text
                  className="dark-mode-text"
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#171717",
                    margin: "0",
                  }}
                >
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </Column>
            </Row>
            {index < items.length - 1 && (
              <Hr
                className="dark-mode-border"
                style={{
                  borderColor: "#e5e5e5",
                  margin: "12px 0",
                }}
              />
            )}
          </Section>
        ))}
      </Section>

      {/* Next Steps */}
      <Section
        className="dark-mode-card dark-mode-border"
        style={{
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e5e5",
          borderRadius: "8px",
          padding: "20px",
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
          📦 Next Steps
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
          1. Log in to your vendor dashboard
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
          2. Prepare your items for shipment
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
          3. Update the order status once shipped
        </Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button
          href={dashboardUrl}
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
          Go to Vendor Dashboard
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
        Need help? Visit your{" "}
        <a
          href={dashboardUrl}
          style={{ color: "#667eea", textDecoration: "none" }}
        >
          vendor dashboard
        </a>{" "}
        or contact support.
      </Text>
    </BaseTemplate>
  );
};

export default PaymentReceivedEmail;
