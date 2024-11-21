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

export async function generateImage(prompt: string): Promise<string> {
  try {
    const openai = getOpenAIClient();
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a tattoo design: ${prompt}. Make it detailed and artistic, suitable for a tattoo.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    });

    return response.data[0].url || '';
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('OpenAI API is not properly configured. Please contact the administrator.');
      }
      throw new Error(error.message);
    }
    throw new Error('Failed to generate image');
  }
}

export async function generateTextDesign(
  text: string,
  style: string,
  isAmbigram: boolean
): Promise<string> {
  try {
    const openai = getOpenAIClient();
    
    const prompt = `Create a ${style} text design${isAmbigram ? ' as an ambigram' : ''} for: ${text}`;
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    });

    return response.data[0].url || '';
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('OpenAI API is not properly configured. Please contact the administrator.');
      }
      throw new Error(error.message);
    }
    throw new Error('Failed to generate text design');
  }
}