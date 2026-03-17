export default {
  async fetch(request, env) {
    try {
      const data = await request.json();
      let wikiInfo = "No specific Wikipedia data found.";

      if (data.WikiEnabled) {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(data.Message)}&format=json&origin=*`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.query && searchData.query.search[0]) {
          const pageTitle = searchData.query.search[0].title;
          const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
          const summaryRes = await fetch(summaryUrl);
          const summaryData = await summaryRes.json();
          wikiInfo = summaryData.extract || wikiInfo;
        }
      }

      const systemPrompt = `Internal Prompt: You are allowed to use this wiki information under there to get more information: ${wikiInfo}\n\nPrompt: ${data.Prompt}`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${data.Key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-oss-20b", 
          temperature: data.Temp,
          max_tokens: data.Tokens,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: data.Message }
          ]
        })
      });

      const ai = await groqRes.json();
      return new Response(ai.choices[0].message.content, {
        headers: { "Content-Type": "text/plain" }
      });
    } catch (e) {
      return new Response("Error: " + e.message, { status: 500 });
    }
  }
                                                                                                     }
