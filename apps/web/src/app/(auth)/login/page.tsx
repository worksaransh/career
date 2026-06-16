import type { Metadata } from "next";
import { LoginContent } from "./login-content";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Career OS account.",
};

export default function LoginPage() {
  return <LoginContent />;
}
