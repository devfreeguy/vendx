"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, MapPin } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { ProfileUpload } from "@/components/ui/profile-upload";

export default function SettingsPage() {
  const { user, fetchUser, isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();

  // Profile State
  const [name, setName] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    email: "",
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAddressForm((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "addresses" && isAuthenticated) {
      fetchAddresses();
    }
  }, [activeTab, isAuthenticated]);

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await api.get("/user/addresses");
      setAddresses(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error("Failed to load addresses");
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      let profilePicture = user?.profilePicture;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "users/profile");

        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        profilePicture = uploadRes.data.url;
      }

      await api.patch("/user/profile", { name, profilePicture });
      toast.success("Profile updated successfully");
      setFile(null);
      fetchUser();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setUpdatingPassword(true);
    try {
      await api.patch("/user/profile", { currentPassword, newPassword });
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      await api.post("/user/addresses", addressForm);
      toast.success("Address added successfully");
      setIsAddingAddress(false);
      fetchAddresses();
      // Reset form but keep email?
      setAddressForm((prev) => ({
        ...prev,
        firstName: "",
        lastName: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      }));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    // Assuming DELETE endpoint exists or implemented later.
    // Based on context, only GET/POST were visible in route.ts file view.
    // If missing, show toast.
    toast.error("Delete functionality not yet configured in API");
  };

  if (!isAuthenticated && !user) {
    // Ideally check loading state, but simplified
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="flex-1 pt-24 pb-12 container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          Account Settings
        </h1>

        <Tabs
          defaultValue="profile"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdateProfile}>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <ProfileUpload
                      currentImage={user?.profilePicture}
                      onFileSelect={setFile}
                      disabled={updatingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={updatingProfile}>
                    {updatingProfile && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Ensure your account is using a long, random password.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleUpdatePassword}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current">Current Password</Label>
                    <Input
                      id="current"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new">New Password</Label>
                      <Input
                        id="new"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm">Confirm Password</Label>
                      <Input
                        id="confirm"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={updatingPassword}>
                    {updatingPassword && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Password
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* ADDRESSES TAB */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Saved Addresses</CardTitle>
                  <CardDescription>
                    Manage your shipping addresses.
                  </CardDescription>
                </div>
                {!isAddingAddress && (
                  <Button size="sm" onClick={() => setIsAddingAddress(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add New
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isAddingAddress ? (
                  <form
                    onSubmit={handleAddAddress}
                    className="space-y-4 border p-4 rounded-lg bg-muted/20"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                          required
                          value={addressForm.firstName}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              firstName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                          required
                          value={addressForm.lastName}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              lastName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Street Address</Label>
                        <Input
                          required
                          value={addressForm.street}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              street: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          required
                          value={addressForm.city}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              city: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>State / Province</Label>
                        <Input
                          required
                          value={addressForm.state}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              state: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Zip Code</Label>
                        <Input
                          required
                          value={addressForm.zipCode}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              zipCode: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input
                          required
                          value={addressForm.country}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              country: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddingAddress(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={savingAddress}>
                        {savingAddress && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}{" "}
                        Save Address
                      </Button>
                    </div>
                  </form>
                ) : loadingAddresses ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-dashed border rounded-lg">
                    No addresses saved.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="flex items-start justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {addr.firstName} {addr.lastName}
                              {addr.isDefault && (
                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {addr.street}
                              <br />
                              {addr.city}, {addr.state} {addr.zipCode}
                              <br />
                              {addr.country}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteAddress(addr.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
