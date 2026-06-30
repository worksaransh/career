import React from "react";
import fs from "fs/promises";
import path from "path";
import { ScreensClient } from "./screens-client";

export const metadata = {
  title: "Mockup Simulator & Design Hub - Career OS",
};

export default async function AdminScreensPage() {
  const metadataPath = path.join(process.cwd(), "public", "screens", "metadata.json");
  
  let screens = [];
  try {
    const rawData = await fs.readFile(metadataPath, "utf8");
    screens = JSON.parse(rawData);
  } catch (err) {
    console.error("Failed to read screens metadata.json:", err);
  }

  return <ScreensClient initialScreens={screens} />;
}
