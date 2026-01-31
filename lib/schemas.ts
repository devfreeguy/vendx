import { z } from "zod";

export const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be positive"),
  discountPrice: z
    .number()
    .min(0, "Discount price must be positive")
    .optional()
    .nullable(),
  stock: z.number().int().min(0, "Stock must be non-negative"),
  sku: z.string().min(1, "SKU is required"),
  images: z.array(z.string()).default([]),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
});

export const updateProductSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  discountPrice: z.number().min(0).optional().nullable(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().min(1).optional(),
  images: z.array(z.string()).optional(),
  category: z.string().min(1).optional(),
  subcategory: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z
    .enum(["BUYER", "VENDOR"])
    .describe("Role must be either BUYER or VENDOR"),
});

export const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
});

export const syncCartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
    }),
  ),
});

export const addressSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Invalid email for shipping"),
  street: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "Zip Code is required"),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "Order must contain at least one item"),
  shippingAddress: addressSchema,
});
