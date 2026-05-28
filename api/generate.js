export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, max_tokens } = req.body;

    // Convert Anthropic message format to OpenAI/Groq format
    const groqMessages = messages.map(msg => {
      if (typeof msg.content === 'string') {
        return { role: msg.role, content: msg.content };
      }
      // Handle array content (text + image)
      const textParts = msg.content.filter(c => c.type === 'text').map(c => c.text).join('\n');
      return { role: msg.role, content: textParts };
    });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        max_tokens: max_tokens || 1000
      })
    });

    const data = await response.json();

    // Convert Groq response to Anthropic format so the app works without changes
    const text = data.choices?.[0]?.message?.content || '';
    res.status(200).json({
      content: [{ type: 'text', text }]
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao chamar a API' });
  }
}
