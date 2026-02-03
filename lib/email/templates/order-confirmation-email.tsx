import {
  Text,
  Button,
  Section,
  Row,
  Column,
  Img,
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

interface OrderConfirmationEmailProps {
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  bchAmount: number;
  bchAddress: string;
  orderUrl: string;
  expiresAt: Date;
}

export const OrderConfirmationEmail = ({
  orderId,
  buyerName,
  buyerEmail,
  items,
  totalAmount,
  bchAmount,
  bchAddress,
  orderUrl,
  expiresAt,
}: OrderConfirmationEmailProps) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <BaseTemplate preview={`Order Confirmation - ${orderId}`}>
      <Text
        className="dark-mode-text"
        style={{
          fontSize: "24px",
          fontWeight: "600",
          color: "#171717",
          margin: "0 0 8px 0",
        }}
      >
        Order Confirmed! 🎉
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
        Hi {buyerName || "there"}, thank you for your order! We've received
        your order and are waiting for payment confirmation.
      </Text>

      {/* Order Items */}
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
            margin: "0 0 16px 0",
          }}
        >
          Order Items
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
        <Hr
          className="dark-mode-border"
          style={{
            borderColor: "#d4d4d4",
            margin: "16px 0",
          }}
        />
        <Row>
          <Column style={{ width: "70%" }}>
            <Text
              className="dark-mode-text"
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#171717",
                margin: "0",
              }}
            >
              Total
            </Text>
          </Column>
          <Column style={{ width: "30%", textAlign: "right" }}>
            <Text
              className="dark-mode-text"
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#171717",
                margin: "0",
              }}
            >
              ${totalAmount.toFixed(2)}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Payment Instructions */}
      <Section
        style={{
          backgroundColor: "#ede9fe",
          border: "1px solid #a78bfa",
          borderRadius: "8px",
          padding: "20px",
          margin: "0 0 24px 0",
        }}
      >
        <Text
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#5b21b6",
            margin: "0 0 12px 0",
          }}
        >
          💳 Payment Instructions
        </Text>
        <Text
          style={{
            fontSize: "14px",
            color: "#6b21a8",
            lineHeight: "20px",
            margin: "0 0 16px 0",
          }}
        >
          Please send <strong>{bchAmount.toFixed(8)} BCH</strong> to the
          address below:
        </Text>
        <Section
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #c4b5fd",
            borderRadius: "6px",
            padding: "12px",
            margin: "0 0 12px 0",
          }}
        >
          <Text
            style={{
              fontSize: "12px",
              fontFamily: "monospace",
              color: "#5b21b6",
              wordBreak: "break-all",
              margin: "0",
            }}
          >
            {bchAddress}
          </Text>
        </Section>
        <Text
          style={{
            fontSize: "12px",
            color: "#7c3aed",
            margin: "0",
          }}
        >
          ⏰ Payment expires: {formatDate(expiresAt)}
        </Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button
          href={orderUrl}
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
          View Order Details
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
        Questions about your order? Visit your{" "}
        <a
          href={orderUrl}
          style={{ color: "#667eea", textDecoration: "none" }}
        >
          order page
        </a>{" "}
        or contact support.
      </Text>
    </BaseTemplate>
  );
};

export default OrderConfirmationEmail;
