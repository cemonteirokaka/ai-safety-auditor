import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

export async function POST(request) {
  try {
    const data = await request.json();
    const { base64Image, accessCode } = data;

    // VALIDAÇÃO DA SENHA DO SITE
    if (process.env.SITE_PASSWORD && accessCode !== process.env.SITE_PASSWORD) {
      return NextResponse.json({ error: 'Acesso negado: Código incorreto.' }, { status: 401 });
    }

    if (!base64Image) {
      return NextResponse.json({ error: 'Nenhuma imagem enviada.' }, { status: 400 });
    }

    // Identifica o formato real (PNG, JPEG, etc.) para a OpenAI não rejeitar
    let mimeType = 'image/jpeg';
    if (base64Image.startsWith('data:')) {
      const match = base64Image.match(/^data:([^;]+);base64,/);
      if (match) {
        mimeType = match[1];
      }
    }

    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    // 1. Chamada para análise técnica (GPT-4o) - CALIBRADO PARA FORÇAR O MESMO OBJETO
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analise a imagem como um técnico de Segurança do Trabalho (GRO/PGR). Identifique riscos e sugira S e P (1-5). Retorne APENAS um JSON puro com as chaves: 'analise_risco' (lista com 'perigo', 'cenario', 'impacto', 'matriz':{'s', 'p'}) e 'prompt_melhoria' (descrição em ENGLISH detalhada para o DALL-E 3 recriar EXATAMENTE a mesma cena e o mesmo objeto principal da foto original, mas em uma versão modificada: totalmente limpa, organizada no padrão 5S, com as devidas proteções de segurança industrial aplicadas, sem fiações expostas e com demarcações de segurança no chão)." 
            },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${cleanBase64}` } },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    // Transforma a resposta em objeto de forma segura
    const responseContent = visionResponse.choices[0].message.content;
    const analysis = responseContent ? JSON.parse(responseContent) : null;

    if (!analysis || !analysis.analise_risco) {
      return NextResponse.json({ 
        error: 'A OpenAI não conseguiu processar a imagem no formato correto. Verifique seu saldo de créditos.' 
      }, { status: 500 });
    }

    // 2. Chamada para o DALL-E 3 isolada
    let generatedImage = null;
    try {
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        // O prompt agora vai ultra detalhado mantendo o foco no objeto original
        prompt: `Realistic industrial photo, high quality, safety standards compliance: ${analysis.prompt_melhoria}`,
        n: 1,
        size: "1024x1024",
      });
      
      generatedImage = imageResponse.data[0].url; 
    } catch (imgError) {
      // Se cair aqui, ele vai printar o motivo exato do erro no console da Vercel
      console.error("DALL-E 3 FALHOU E USOU CÓPIA DE SEGURANÇA. MOTIVO:", imgError.message);
      
      // Retorna a imagem original para não quebrar o layout do site
      generatedImage = base64Image;
    }

    return NextResponse.json({
      risks: analysis.analise_risco,
      generatedImage: generatedImage
    });

  } catch (error) {
    console.error("Erro crítico na API:", error);
    return NextResponse.json({ error: `Erro na IA: ${error.message}` }, { status: 500 });
  }
}