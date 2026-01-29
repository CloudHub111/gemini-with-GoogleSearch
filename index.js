export default {
  async fetch(req, env) {

    const debug = new URL(req.url).searchParams.get("debug") === "1";

    try {

      if (!env.GEMINI_API_KEY) {
        return new Response("Missing GEMINI_API_KEY", { status: 500 });
      }

      let prompt;

      if (req.method === "POST") {
        const body = await req.json();
        prompt = body?.prompt;
      } else {
        prompt = new URL(req.url).searchParams.get("prompt");
      }

      if (!prompt) {
        return new Response("Missing prompt", { status: 400 });
      }

      const gemini = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [{ text: prompt }]
            }],
            tools: [{ "google_search": {} }]
          }),
        }
      );

      const raw = await gemini.text();

      if (!gemini.ok) {
        return new Response(
          debug ? raw : "Gemini request failed",
          { status: gemini.status }
        );
      }

      const data = JSON.parse(raw);

      const text =
        data?.candidates?.[0]?.content?.parts
          ?.map(p => p.text)
          ?.join("") || "No response";

      // ⭐ DEBUG RESPONSE
      if (debug) {
        return Response.json({
          success: true,
          prompt,
          gemini_status: gemini.status,
          raw_response: data,
          parsed_text: text
        });
      }

      return Response.json({ text });

    } catch (err) {

      return new Response(
        debug
          ? JSON.stringify({
              crash: true,
              message: err.message,
              stack: err.stack
            }, null, 2)
          : "Worker crashed",
        { status: 500 }
      );
    }
  },
};
