import type { Metadata } from "next";
import { RegisterContent } from "./register-content";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Career OS account and discover your future career path.",
};

export default function RegisterPage() {
  return <RegisterContent />;
}
