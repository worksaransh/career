import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("shows error state", () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows hint text", () => {
    render(<Input label="Name" hint="Enter your full name" />);
    expect(screen.getByText("Enter your full name")).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    render(<Input label="Password" type="password" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");

    const toggleButton = screen.getByLabelText("Show password");
    await userEvent.click(toggleButton);
    expect(input).toHaveAttribute("type", "text");
  });
});
