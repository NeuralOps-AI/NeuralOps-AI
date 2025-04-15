// components/AccountTab.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs"; // for client‐side user
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  UserCircle,
  Camera,
  Upload,
  X,
  CheckIcon,
  CheckCircle,
  Mail,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AccountTabProps {
  value: string;
  tabChangeAnimation: boolean;
  slideUp: any;
}

export function AccountTab({ value, tabChangeAnimation, slideUp }: AccountTabProps) {
  // Clerk user
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  // form state
  const [fullName, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // init from Clerk user metadata
  useEffect(() => {
    console.debug("Initializing form from user:", user);
    setFullName(user?.fullName || "");
    setUsername(user?.username || "");
    setBio(typeof user?.publicMetadata?.bio === "string" ? user.publicMetadata.bio : "");
    setAvatarPreview(user?.imageUrl || "");
  }, [user]);

  // click “Change” or avatar overlay
  function handleAvatarUploadClick() {
    console.debug("Triggering file input click");
    fileInputRef.current?.click();
  }

  // file selected
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    console.debug("Selected avatar file:", file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);

    // TODO: actually upload to S3/Cloudinary and get real URL
    // For now we just store the preview URL
  }

  // remove avatar
  async function handleAvatarRemove() {
    console.debug("Removing avatar");
    await handleSaveProfile({ avatarUrl: null });
  }

  // generic save
  async function handleSaveProfile(overrides?: { avatarUrl: string | null }) {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const payload = {
        name: fullName,
        username,
        bio,
        avatarUrl: overrides?.avatarUrl ?? avatarPreview,
      };
      console.debug("Saving profile with payload:", payload);

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error("API error:", err);
        throw new Error(err.error || "Unknown error");
      }

      const { user: updatedUser } = await res.json();
      console.debug("API response user:", updatedUser);
      setSaveSuccess(true);

      // update Clerk user metadata if needed
      // e.g. clerkClient.users.updateUser(user.id, { publicMetadata: { bio } })
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Account Tab */}
      <AnimatePresence mode="wait">
        <TabsContent value={value} className={tabChangeAnimation ? "animate-in fade-in-50" : ""}>
          <motion.div
            key="account-tab"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideUp}
          >
            <Card className="border-none shadow-md bg-black border-zinc-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    className="p-1.5 rounded-full bg-primary/10"
                  >
                    <UserCircle className="h-4 w-4 text-primary" />
                  </motion.div>
                  Profile Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5 pt-0">
                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert className="bg-green-900/20 border-green-900/30 text-green-300">
                      <CheckIcon className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Your profile has been updated successfully.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                <div className="flex items-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} className="relative group">
                    <Avatar className="h-14 w-14 border border-zinc-800 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                      <AvatarImage src={avatarPreview} alt={fullName || "User"} />
                      <AvatarFallback className="bg-black text-zinc-100">
                        {(fullName?.charAt(0) || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center cursor-pointer"
                      onClick={handleAvatarUploadClick}
                    >
                      <Camera className="h-5 w-5 text-white" />
                    </motion.div>
                  </motion.div>

                  <div>
                    <p className="text-sm font-medium text-white">{fullName}</p>
                    <p className="text-xs text-zinc-400">{email}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs px-3 bg-black border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700"
                        onClick={handleAvatarUploadClick}
                        disabled={loading}
                      >
                        <Upload className="h-3 w-3 mr-1.5" /> Change
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs px-3 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={handleAvatarRemove}
                        disabled={loading || !avatarPreview}
                      >
                        <X className="h-3 w-3 mr-1.5" /> Remove
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="my-3 bg-zinc-900" />

                <div className="grid gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="name" className="text-xs text-zinc-300">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="h-9 text-sm bg-black border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-primary/50 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="username" className="text-xs text-zinc-300">
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                      className="h-9 text-sm bg-black border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-primary/50 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="bio" className="text-xs text-zinc-300">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself"
                      className="text-sm resize-none h-24 bg-black border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-primary/50 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 pb-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="ml-auto">
                  <Button
                    size="sm"
                    onClick={() => handleSaveProfile()}
                    disabled={loading}
                    className="h-9 text-xs px-4 bg-primary hover:bg-primary/90"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        Saving
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </AnimatePresence>
    </>
  );
}
