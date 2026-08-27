"use client";

import { useState } from "react";
import Link from "next/link";
import { AxiosError } from "axios";

import AuthCard from "./AuthCard";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useRouter } from "next/navigation";

import { registerUser } from "@/services/auth.service";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("manufacturer");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

 const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  setLoading(true);

  try {
    const response = await registerUser({
      full_name: fullName,
      email,
      password,
      role,
    });

    console.log("Registration Successful:", response);

    alert("Registration Successful! Please login.");

    router.push("/login");
  } catch (error: unknown) {
    console.error(error);

    if (error instanceof AxiosError) {
      alert(
        error.response?.data?.detail ??
          "Registration Failed"
      );
    } else {
      alert("Registration Failed");
    }
  } finally {
    setLoading(false);
  }
}; 
  return (
    <AuthCard title="Create Account" subtitle="Register to continue">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full Name"
          placeholder="Enter Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <Input
          label="Email"
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div>
          <label className="mb-2 block text-lg font-semibold text-gray-700">
            Role
          </label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg outline-none focus:border-blue-500"
          >
            <option value="manufacturer">Textile Manufacturer</option>

            <option value="recycler">Recycler</option>

            <option value="admin">Admin</option>

            <option value="manager">Sustainability Manager</option>
          </select>
        </div>

        <Button type="submit">{loading ? "Registering..." : "Register"}</Button>

        <p className="text-center text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
