export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/chat") {
      return new Response("Not Found", { status: 404 });
    }

    if (request.method !== "POST") {
      return new Response("Only POST allowed", { status: 405 });
    }

    try {
      const { prompt, model } = await request.json();

      if (!prompt) {
        return new Response(JSON.stringify({ error: "Missing prompt" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const puterModule = await import("https://esm.sh/@heyputer/puter.js");
      const puter = puterModule.default;

      const ai = await puter.ai.chat(prompt, {
        model: model || "deepseek/deepseek-v3.2"
      });

      const text =
        ai?.message?.content ||
        ai?.content ||
        "No response";

      return new Response(JSON.stringify({ response: text }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
