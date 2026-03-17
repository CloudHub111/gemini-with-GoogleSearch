export default {
  async fetch(request, env) {
    try {
      const data = await request.json();

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${data.Key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: data.ModelName || "gpt-oss-20b", 
          temperature: data.Temp,
          max_tokens: data.Tokens,
          messages: [
            { role: "system", content: data.Prompt },
            { role: "user", content: data.Message }
          ]
        })
      });

      const ai = await groqRes.json();
      
      if (!ai.choices || !ai.choices[0]) {
        return new Response("AI Error: " + JSON.stringify(ai), { status: 500 });
      }

      return new Response(ai.choices[0].message.content, {
        headers: { "Content-Type": "text/plain" }
      });
    } catch (e) {
      return new Response("Error: " + e.message, { status: 500 });
    }
  }
}
