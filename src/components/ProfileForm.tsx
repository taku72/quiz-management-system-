"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User as UserIcon, Mail, Save } from "lucide-react";

export const ProfileForm: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  if (!user) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!name || !username || !email) {
      setError("Please fill in all fields");
      return;
    }

    const ok = await updateProfile({ name, username, email });
    if (ok) {
      setMessage("Profile updated successfully");
    } else {
      setError("Failed to update profile");
    }
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <UserIcon className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10"
              placeholder="Your full name"
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <UserIcon className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10"
              placeholder="Your username"
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Mail className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              placeholder="Your email"
              disabled={isLoading}
            />
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="inline-flex items-center">
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};