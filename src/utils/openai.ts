import OpenAI from 'openai';

const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
};

export async function generateArticle(topic: string) {
  try {
    const openai = getOpenAIClient();
    
    const prompt = `Write an engaging and informative article about tattoos on the following topic: ${topic}

The article should:
1. Have an attention-grabbing title
2. Include historical context where relevant
3. Discuss cultural significance and symbolism
4. Provide practical insights or considerations
5. Be written in an engaging, conversational tone
6. Be well-structured with clear sections

Please format the response as a JSON object with 'title' and 'content' fields.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" }
    });

    return JSON.parse(completion.choices[0].message.content || '{"title": "", "content": ""}');
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('OpenAI API is not properly configured. Please contact the administrator.');
      }
      throw new Error(error.message);
    }
    throw new Error('Failed to generate article');
  }
}