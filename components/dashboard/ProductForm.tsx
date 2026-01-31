"use client";

import { ProductGallery } from "@/components/products/ProductGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import categoriesData from "@/data/categories.json";
import { DollarSign, ImagePlus, RefreshCw, Tag, X } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils"; // Import cn
import { useModal } from "@/components/dashboard/ModalContext";
// ...
interface ProductFormProps {
  product?: {
    id: string;
    title: string;
    description: string;
    price: number;
    discountPrice?: number;
    stock: number;
    sku: string;
    images: string[];
    category: string;
    subcategory?: string;
    tags: string[];
  };
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
  isModal?: boolean;
}

export function ProductForm({
  product,
  onSubmit,
  isLoading,
  isModal: isModalProp = false,
}: ProductFormProps) {
  const isModalContext = useModal();
  const isModal = isModalProp || isModalContext;

  const [formData, setFormData] = useState({
    title: product?.title || "",
    description: product?.description || "",
    price: product?.price || "",
    discountPrice: product?.discountPrice || "",
    stock: product?.stock || "",
    sku: product?.sku || "",
    images: product?.images || [],
    category: product?.category || "",
    subcategory: product?.subcategory || "",
    tags: product?.tags?.join(", ") || "",
  });
  const [activeTab, setActiveTab] = useState("details");

  const categories = categoriesData;
  const subcategories =
    categories.find((c) => c.label === formData.category)?.items || [];

  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    setIsUploading(true);
    let finalImageUrls = [...formData.images];

    try {
      if (newImageFiles.length > 0) {
        const uploadPromises = newImageFiles.map(async (file) => {
          const uploadData = new FormData();
          uploadData.append("file", file);
          uploadData.append("folder", "products");

          const res = await fetch("/api/upload", {
            method: "POST",
            body: uploadData,
          });
          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.error?.message || "Upload failed");
          }
          return json.data.url;
        });
        const uploadedUrls = await Promise.all(uploadPromises);
        finalImageUrls = [...finalImageUrls, ...uploadedUrls];
      }

      onSubmit({
        ...formData,
        images: finalImageUrls,
        tags: formData.tags.split(",").map((t: string) => t.trim()),
      });
    } catch (error) {
      console.error("Error submitting form", error);
      // Handle error visually
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    // Create preview URLs
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));

    setNewImageFiles((prev) => [...prev, ...files]);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newPreviewUrls],
    }));

    // Clear input
    e.target.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    // We need to determine if the removed image was an existing one or a new one to keep newImageFiles in sync
    // However, formData.images contains mixed URLs (strings from DB and blob: URLs from local)
    // The easiest heuristic if they are appended in order:
    // But user might remove from middle.

    // Better strategy: We only track visual previews in formData.images.
    // But we need to sync newImageFiles.

    // Let's refine the strategy:
    // images: string[] (contains ALL urls to show).
    // We need to know which index corresponds to which file in newImageFiles.

    // Actually, since we just appended, if indexToRemove < initialImagesLength, it's an existing image.
    // If indexToRemove >= initialImagesLength, it's a new file at index (indexToRemove - initialImagesLength).

    // Let's rely on the fact that `product.images` is the source of truth for initial images.
    // Wait, `formData` changes.

    // Simplified approach: separate `existingImages` and `newImages` arrays in state might be cleaner,
    // but `ProductGallery` expects a single array.

    // Let's check if the URL is a blob URL.
    const urlToRemove = formData.images[indexToRemove];
    if (urlToRemove.startsWith("blob:")) {
      // It's a new file. We need to find which file corresponds to this blob URL.
      // Since we created blob URLs from files, we can't easily map back unless we kept map.
      // But rely on order: new images are always at the end?
      // No, user can delete old images.
      // Let's reconstruct newImageFiles.
      // We can't easily match blob URL to File object without keeping a mapping.
      // REFACTOR: Store new images as objects { file: File, preview: string } in a separate state?
      // But we need to pass a string[] to ProductGallery.
      // Let's just filter `newImageFiles` by checking if `URL.createObjectURL(file)` matches? No, creates new URL.
      // OPTION B: Filter from `newImageFiles` by index?
      // We can track how many "real" (non-blob) images are currently in list.
      // Let's do this:
      // When adding files, we store them in `newImageFiles`.
      // We also append their preview to `formData.images`.
      // When deleting:
      // If (!startsWith("blob:")), it's a server image. Just remove from formData.images.
      // If (startsWith("blob:")), we need to remove from `newImageFiles`.
      // To find the correct index in `newImageFiles`, we can count how many blob images appeared BEFORE this index.
    }

    const isBlob = urlToRemove.startsWith("blob:");

    setFormData((prev) => {
      const newImages = prev.images.filter(
        (_: string, index: number) => index !== indexToRemove,
      );
      return { ...prev, images: newImages };
    });

    if (isBlob) {
      // Count how many blobs were before this index in the current list
      let blobCountBefore = 0;
      for (let i = 0; i < indexToRemove; i++) {
        if (formData.images[i].startsWith("blob:")) {
          blobCountBefore++;
        }
      }

      setNewImageFiles((prev) =>
        prev.filter((_, idx) => idx !== blobCountBefore),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <ScrollArea
          className={cn(
            "mt-4 rounded-md",
            isModal ? "h-[60vh] border p-4" : "h-auto",
          )}
        >
          <TabsContent value="details" className="space-y-4 m-0">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title</Label>
              <Input
                id="title"
                placeholder="e.g. Wireless Mechanical Keyboard"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val) =>
                    setFormData({ ...formData, category: val, subcategory: "" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.label} value={cat.label}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subcategory</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(val) =>
                    setFormData({ ...formData, subcategory: val })
                  }
                  disabled={!formData.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((sub) => (
                      <SelectItem key={sub.label} value={sub.label}>
                        {sub.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-30 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe your product..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                icon={Tag}
                id="tags"
                placeholder="electronics, wireless, keyboard"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={() => setActiveTab("media")}>
                Next: Media
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4 m-0">
            <div className="space-y-4 flex flex-col items-center">
              <div className="w-full flex items-center justify-between">
                <Label>Product Images</Label>
                <div className="relative">
                  <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                    disabled={isUploading}
                    asChild
                  >
                    <label htmlFor="image-upload">
                      <ImagePlus className="mr-2 h-4 w-4" />
                      {isUploading ? "Uploading..." : "Add Images"}
                    </label>
                  </Button>
                </div>
              </div>

              {formData.images.length > 0 ? (
                <div className="max-w-sm w-full rounded-3xl border border-border p-4">
                  <ProductGallery
                    images={formData.images}
                    title={formData.title || "Product Preview"}
                    showThumbnails={false}
                  />
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {formData.images.map((img: string, idx: number) => (
                      <div key={idx} className="h-20 w-20 relative group">
                        <img
                          src={img}
                          alt="Preview"
                          className="size-full rounded-md object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-64 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 text-muted-foreground">
                  <ImagePlus className="mb-4 h-10 w-10 opacity-50" />
                  <p>No images uploaded</p>
                  <p className="text-xs">
                    Upload images to see the gallery preview
                  </p>
                </div>
              )}
            </div>

            <div className="w-full flex justify-between mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("details")}
              >
                Back
              </Button>
              <Button type="button" onClick={() => setActiveTab("inventory")}>
                Next: Inventory
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4 m-0">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  icon={DollarSign}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPrice">Sale Price (Optional)</Label>
                <Input
                  id="discountPrice"
                  icon={DollarSign}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.discountPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, discountPrice: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    placeholder="PROD-001"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const randomSku = `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                      setFormData({ ...formData, sku: randomSku });
                    }}
                    title="Generate Random SKU"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("media")}
              >
                Back
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : product
                    ? "Update Product"
                    : "Create Product"}
              </Button>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </form>
  );
}
