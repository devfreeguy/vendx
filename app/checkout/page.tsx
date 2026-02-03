"use client";

import api from "@/lib/axios";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCartStore } from "@/hooks/useCartStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
type Address = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  isDefault: boolean;
};

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [saveAddress, setSaveAddress] = useState(true);

  // Set document title
  useEffect(() => {
    document.title = "Checkout | VendX";
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const subtotal = items.reduce(
    (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
    0,
  );

  // Fetch Saved Addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await api.get<Address[]>("/user/addresses");
        // @ts-ignore: Interceptor handling
        const list = Array.isArray(data) ? data : [];

        if (list.length > 0) {
          setAddresses(list);
          setSelectedAddressId(list[0].id);
          // Pre-fill form with default? No, keep form separate or fill if selected?
          // Strategy: If 'new' selected, show empty form.
          // If existing selected, use that data (don't show form inputs, just summary).
        }
      } catch (err) {
        console.error("Failed to load addresses", err);
      }
    };
    fetchAddresses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    // Validate if New Address
    let finalAddress = selectedAddress;

    if (selectedAddressId === "new") {
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.email ||
        !formData.street ||
        !formData.city ||
        !formData.state ||
        !formData.zipCode ||
        !formData.country
      ) {
        toast.error("Please fill in all shipping fields.");
        return;
      }

      // Prepare Address Object
      const newAddressStr = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
      };

      // Save if requested
      if (saveAddress) {
        try {
          const saved = await api.post<Address>(
            "/user/addresses",
            newAddressStr,
          );
          finalAddress = saved as any;
        } catch (err) {
          console.error("Failed to save address", err);
          // Continue with temp address? Or user might want to retry.
          // We'll proceed with order using raw data if save failed?
          // The API requires 'shippingAddress' object.
          // We'll construct a temp object with ID if possible? No.
        }
      }

      // If we didn't save (or failed), we pass the raw object to Order API
      if (!finalAddress) {
        finalAddress = {
          ...newAddressStr,
          id: "",
          isDefault: false,
        } as Address;
      }
    }

    if (!finalAddress) return;

    setIsPlacingOrder(true);
    try {
      const payload = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          firstName: finalAddress.firstName,
          lastName: finalAddress.lastName,
          email: finalAddress.email,
          street: finalAddress.street,
          city: finalAddress.city,
          state: finalAddress.state,
          zipCode: finalAddress.zipCode,
          country: finalAddress.country,
        },
      };

      const order = (await api.post("/orders", payload)) as any;

      if (order && order.id) {
        clearCart();
        router.push(`/orders/${order.id}`);
      }
    } catch (error) {
      console.error("Failed to place order", error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12 w-full max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid gap-8 md:grid-cols-2 md">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Details</CardTitle>
                <CardDescription>
                  Enter your shipping information or select a saved address.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {addresses.length > 0 && (
                  <div className="space-y-2">
                    <Label>Saved Addresses</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                    >
                      <option value="new">-- Add New Address --</option>
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.firstName} {addr.lastName} - {addr.street},{" "}
                          {addr.city}
                          {addr.isDefault ? " (Default)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedAddressId === "new" ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Receiver Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        placeholder="123 Main St"
                        value={formData.street}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="New York"
                          value={formData.city}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State / Province</Label>
                        <Input
                          id="state"
                          placeholder="NY"
                          value={formData.state}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">Postal / Zip Code</Label>
                        <Input
                          id="zipCode"
                          placeholder="10001"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          placeholder="United States"
                          value={formData.country}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Checkbox
                        id="saveAddress"
                        checked={saveAddress}
                        onCheckedChange={(c) => setSaveAddress(!!c)}
                      />
                      <Label
                        htmlFor="saveAddress"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Save this address for future orders
                      </Label>
                    </div>
                  </>
                ) : (
                  <div className="p-4 border rounded-md bg-muted/50 text-sm space-y-1">
                    <p className="font-medium">
                      {selectedAddress?.firstName} {selectedAddress?.lastName}
                    </p>
                    <p>{selectedAddress?.email}</p>
                    <p>{selectedAddress?.street}</p>
                    <p>
                      {selectedAddress?.city}, {selectedAddress?.state}{" "}
                      {selectedAddress?.zipCode}
                    </p>
                    <p>{selectedAddress?.country}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || items.length === 0}
            >
              {isPlacingOrder ? "Placing Order..." : "Place Order"}
            </Button>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.title} x {item.quantity}
                      </span>
                      <span>
                        $
                        {(
                          (item.discountPrice || item.price) * item.quantity
                        ).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-4 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/cart">Back to Cart</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
