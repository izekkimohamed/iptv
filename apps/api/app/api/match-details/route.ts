import { NextResponse } from "next/server";

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("id");
  const corsHeaders = getCorsHeaders(request);

  if (!gameId)
    return NextResponse.json(
      { error: "Missing gameId" },
      { status: 400, headers: corsHeaders }
    );

  // 365Scores Game Center URL
  const url = `https://webws.365scores.com/web/game/?appTypeId=5&langId=1&timezoneName=UTC&gameId=${gameId}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.365scores.com/",
      },
    });

    const data = await response.json();
    console.log("data", data);

    // We return just the Game object which contains:
    // .events (Goals, Cards, Subs)
    // .stats (Possession, Shots, etc.)
    return NextResponse.json(data.game, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch match details" },
      { status: 500, headers: corsHeaders }
    );
  }
}
