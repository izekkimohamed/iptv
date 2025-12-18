import { NextResponse } from "next/server";

// 1. Improved CORS helper to handle local and production origins
function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: getCorsHeaders(req) });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const competitionId = searchParams.get("competitionId") || "7";
  const corsHeaders = getCorsHeaders(request);
  const today = new Date().toLocaleDateString("en-GB").replace(/\//g, "/");
  // Result: "18/12/2025" (dynamic)

  // This URL focuses on top-tier matches globally
  const TARGET_URL = `https://webws.365scores.com/web/games/allscores/?appTypeId=5&langId=1&timezoneName=Europe/Paris&userCountryId=5&sports=1&startDate=${today}&endDate=${today}&showOdds=false&onlyLiveGames=false&withTop=true&topBookmaker=16`;

  try {
    const response = await fetch(TARGET_URL, {
      method: "GET",
      // 2. Comprehensive Browser Spoofing Headers
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.365scores.com/",
        Origin: "https://www.365scores.com",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
      },
      next: { revalidate: 60 },
    });

    // 3. Status Code Check
    if (!response.ok) {
      console.error(`Upstream API error: ${response.status}`);
      return NextResponse.json(
        { error: `Upstream error: ${response.status}` },
        { status: response.status, headers: corsHeaders }
      );
    }

    // 4. Content-Type Check (Prevents the JSON parse crash)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(
        "API returned non-JSON response. Likely a Cloudflare block page."
      );
      return NextResponse.json(
        {
          error: "Blocked by provider anti-bot protection",
          details: "Received HTML instead of JSON",
        },
        { status: 403, headers: corsHeaders }
      );
    }

    const data = await response.json();
    if (!data.games) return NextResponse.json([], { headers: corsHeaders });

    // 1. Define your "Featured" Competition IDs
    const featuredWhiteslist = [
      11, // English Premier League
      3, // English League Two
      7, // Spanish La Liga
      569, // Spanish Supercopa
      13, // Copa del Rey
      23, // Supercoppa Italiana
      7674, // FIFA Arab Cup
    ];

    // 2. Filter games based on your whitelist OR the "isTop" flag from the API
    let featuredGames = data.games.filter(
      (game: any) =>
        featuredWhiteslist.includes(game.competitionId) || game.isTop === true
    );

    // 3. SORT by popularity (lower rank value = more famous)
    // This ensures Premier League/UEFA shows up before smaller cups
    featuredGames.sort(
      (a: any, b: any) =>
        (a.popularityRank || 999999) - (b.popularityRank || 999999)
    );

    // 4. FALLBACK: If it's a quiet day, just show the top 10 general games
    const finalData =
      featuredGames.length > 0 ? featuredGames : data.games.slice(0, 10);

    return NextResponse.json(finalData, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    // 5. Explicit Error Logging for Terminal
    console.error("CRITICAL PROXY ERROR:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
