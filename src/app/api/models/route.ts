import { NextResponse } from "next/server";

const BASE_URL = "https://api.cerebras.ai/v1";
const API_KEY = process.env.CEREBRAS_API_KEY || "csk_pkp9dymmkfhdydthv46r9jnrxpntdw6wjkmvfnewe4rxny36";

export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();

    // Transform the response to a simpler format
    const models = data.data?.map((model: { id: string; owned_by?: string }) => ({
      id: model.id,
      name: model.id,
      owned_by: model.owned_by,
    })) || [];

    return NextResponse.json({ models });
  } catch (error) {
    console.error("Models API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
