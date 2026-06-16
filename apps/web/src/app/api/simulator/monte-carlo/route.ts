import { NextResponse } from "next/server";
import { z } from "zod";
import { simulationSchema } from "@career-os/validations";
import { runMonteCarloSimulation } from "@/lib/simulator/enhancements";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = simulationSchema.parse(body);
    const results = runMonteCarloSimulation(validated);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.flatten().fieldErrors } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong" } }, { status: 500 });
  }
}
