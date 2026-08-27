"use client";
import { useState } from "react";
import Link from "next/link";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

import AuthCard from "./AuthCard";
import Input from "../ui/Input";
import Button from "../ui/Button";

import { loginUser } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";


export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await loginUser({
        email,
        password,
      });

      login(
      response.user,
      response.access_token
     );
    router.push("/dashboard");
} catch (error: unknown) {
      console.error(error);

      if (error instanceof AxiosError) {
        alert(
          error.response?.data?.detail ??
            "Login Failed"
        );
      } else {
        alert("Login Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Textile Waste Intelligence Platform"
      subtitle="Sign in to continue"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <Button type="submit">
          {loading ? "Logging in..." : "Login"}
        </Button>

        <p className="text-center text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}