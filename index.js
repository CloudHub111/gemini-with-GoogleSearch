export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname !== "/v1/chat/completions") {
      return new Response("Not Found", { status: 404 });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const body = await request.text();

    const upstream = await fetch("https://chatgpt-api.shn.hk/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body
    });

    const text = await upstream.text();

    return new Response(text, {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};
