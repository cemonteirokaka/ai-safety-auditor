import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

export async function POST(request) {
  try {
    const data = await request.json();
    const { base64Image, accessCode } = data;

    // VALIDAÇÃO DA SENHA DA TURMA (Configurada na Vercel como SITE_PASSWORD)
    if (process.env.SITE_PASSWORD && accessCode !== process.env.SITE_PASSWORD) {
      return NextResponse.json({ error: 'Acesso negado: Código incorreto.' }, { status: 401 });
    }

    if (!base64Image) {
      return NextResponse.json({ error: 'Nenhuma imagem enviada.' }, { status: 400 });
    }

    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    // Chamada para análise técnica (GPT-4o)
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analise a imagem como um técnico de Segurança do Trabalho (GRO/PGR). Identifique riscos e sugira S e P (1-5). Retorne APENAS um JSON puro com as chaves: 'analise_risco' (lista com 'perigo', 'cenario', 'impacto', 'matriz':{'s', 'p'}) e 'prompt_melhoria' (descrição em inglês para o DALL-E 3 criar este cenário limpo, organizado e seguro)." 
            },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${cleanBase64}` } },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(visionResponse.choices[0].message.content);

    // Chamada para criar a imagem segura (DALL-E 3)
    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Professional industrial photo, same angle: ${analysis.prompt_melhoria}. 5S organized, safe workplace, high quality.`,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });

    return NextResponse.json({
      risks: analysis.analise_risco,
      generatedImage: `data:image/png;base64,${imageResponse.data[0].b64_json}`
    });

  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro na IA: " + error.message }, { status: 500 });
  }
}