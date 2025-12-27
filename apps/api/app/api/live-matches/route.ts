import { Competition, Game, Root } from "@/utils/types";
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
  const corsHeaders = getCorsHeaders(request);

  // Get date from params (DD/MM/YYYY) or default to today
  const targetDate =
    searchParams.get("date") || new Date().toLocaleDateString("en-GB");

  const TARGET_URL = `https://webws.365scores.com/web/games/allscores/?appTypeId=5&langId=1&timezoneName=Europe/Paris&userCountryId=5&sports=1&startDate=${targetDate}&endDate=${targetDate}&showOdds=false&onlyLiveGames=false&withTop=true`;

  try {
    const response = await fetch(TARGET_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.365scores.com/",
      },
    });

    if (!response.ok) throw new Error("Upstream API failure");

    const data: Root = await response.json();

    if (!data.games || !data.competitions) {
      return NextResponse.json([]);
    }

    // 1. Filter for "Elite" popularity only
    // We'll set a threshold (e.g., 10,000,000) or take the Top 10 by rank
    const POPULARITY_THRESHOLD = 10000000;

    const featuredCompetitions = data.competitions
      .filter(
        (comp: Competition) => comp.popularityRank >= POPULARITY_THRESHOLD
      )
      .sort((a, b) => b.popularityRank - a.popularityRank); // Highest rank first

    const featuredIds = new Set(featuredCompetitions.map((c) => c.id));

    // 2. Map Games to include their Competition Popularity for sorting
    const featuredGames = data.games
      .filter((game: Game) => featuredIds.has(game.competitionId))
      .map((game) => {
        const comp = featuredCompetitions.find(
          (c) => c.id === game.competitionId
        );
        return {
          ...game,
          compPopularity: comp?.popularityRank || 0,
        };
      })
      // 3. Sort games so the absolute most popular matches are at the top
      .sort((a, b) => b.compPopularity - a.compPopularity);

    // 4. Return only the "Elite" data
    return NextResponse.json(featuredGames, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error("Backend Error:", error.message);
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
