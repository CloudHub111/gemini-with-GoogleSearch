export default {
  async fetch(req, env) {

    if (req.method !== "POST") {
      return new Response("Only POST", { status: 405 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const prompt = body?.prompt;

    if (!prompt) {
      return new Response("Missing prompt", { status: 400 });
    }

    const gemini = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyAMPFk1i4KGu11nTl1r6tNG6Xw2I-cMvjg`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: prompt }] }
          ],
          tools: [{ google_search: {} }]
        })
      }
    );

    const data = await gemini.json();

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map(p => p.text)
        ?.join("") || "No response";

    return new Response(
      JSON.stringify({ text }),
      { headers: { "Content-Type": "application/json" } }
    );
  },
};
