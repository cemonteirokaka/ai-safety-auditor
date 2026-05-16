'use client';

import { useState } from 'react';
import { UploadCloud, Zap, Loader2, Lock, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Home() {
  const [image, setImage] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      const reader = new FileReader();
      reader.onloadend = () => setBase64Image(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!base64Image) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image, accessCode }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na análise");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
      
      {/* ONDAS FLUIDAS DE FUNDO */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-800/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>

      {/* CARD PRINCIPAL */}
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl p-8 md:p-10 z-10 relative">
        
        {/* ICONE E TITULO */}
        <div className="text-center space-y-4 mb-10">
          <div className="flex justify-center">
             <UploadCloud size={50} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Envie seus arquivos</h1>
        </div>

        {/* INPUT DE SENHA DISCRETO */}
        <div className="mb-8 space-y-2">
           <div className="relative">
             <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
             <input 
               type="password"
               placeholder="Senha da Turma"
               className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-blue-500 outline-none transition-all text-white"
               value={accessCode}
               onChange={(e) => setAccessCode(e.target.value)}
             />
           </div>
        </div>

        {/* ÁREA DE UPLOAD */}
        <div className="border-2 border-dashed border-slate-800 rounded-[2rem] p-8 text-center hover:border-blue-500 transition-colors group relative">
          {image ? (
            <div className="relative h-40">
              <img src={image} className="w-full h-full object-cover rounded-2xl" alt="Preview" />
              <button onClick={() => { setImage(null); setBase64Image(null); setResult(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-bold text-green-500">JPG</div>
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-bold text-orange-500">PNG</div>
                </div>
                <div>
                  <p className="font-medium">Arraste e Solte</p>
                  <p className="text-slate-500 text-xs mt-1">Formatos suportados</p>
                </div>
                <div className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20">
                  ESCOLHER ARQUIVO
                </div>
              </div>
              <input type="file" className="hidden" onChange={handleImage} accept="image/*" />
            </label>
          )}
        </div>

        {/* BOTÃO DE AÇÃO */}
        {image && (
          <button 
            onClick={startAnalysis}
            disabled={loading || !accessCode}
            className="w-full mt-6 bg-white text-slate-950 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all disabled:opacity-20"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
            {loading ? "ANALISANDO..." : "GERAR ANÁLISE"}
          </button>
        )}

        {/* FEEDBACK DE ERRO REAL */}
        {error && (
          <div className="mt-4 p-4 bg-red-950/50 border border-red-900 rounded-2xl flex items-start gap-3 text-red-400 text-xs">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Falha na Requisição</p>
              <p className="mt-0.5 opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* ASSINATURA UNIFICADA NO RODAPÉ */}
        <div className="mt-8 space-y-1 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
            Assistente de Segurança (Projeto Integrador - Univesp)
          </p>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">
             Criado por Carlos Eduardo Monteiro
          </p>
        </div>

      </div>

      {/* EXIBIÇÃO DOS RESULTADOS DA ANÁLISE TÉCNICA */}
      {result && result.risks && (
        <div className="max-w-2xl w-full mt-6 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl p-6 md:p-8 z-10 relative animate-fadeIn">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
            <CheckCircle className="text-green-500" size={22} />
            <h2 className="text-lg font-bold tracking-tight">Relatório Preliminar de Riscos (GRO/PGR)</h2>
          </div>

          <div className="space-y-6">
            {result.risks.map((item, index) => (
              <div key={index} className="bg-slate-950 p-5 rounded-2xl border border-slate-800/60 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                    {index + 1}. {item.perigo}
                  </h3>
                  <div className="flex gap-2 text-[11px] font-bold shrink-0">
                    <span className="px-2 py-1 bg-slate-800 rounded-md text-orange-400">S: {item.matriz?.s || item.s}</span>
                    <span className="px-2 py-1 bg-slate-800 rounded-md text-amber-400">P: {item.matriz?.p || item.p}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-300"><strong className="text-slate-400">Cenário:</strong> {item.cenario}</p>
                <p className="text-sm text-slate-300"><strong className="text-slate-400">Impacto:</strong> {item.impacto}</p>
              </div>
            ))}
          </div>

          {/* ADICIONADO: CONTAINER DE RENDERIZAÇÃO DA IMAGEM DO DALL-E 3 */}
          {result.generatedImage && (
            <div className="mt-8 border-t border-slate-800 pt-6">
              <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">
                Cenário Idealizado (Ambiente Seguro / 5S)
              </h3>
              {result.generatedImage === "PENDENTE" ? (
                <div className="bg-slate-950 rounded-2xl p-6 text-center border border-dashed border-slate-800">
                  <p className="text-slate-400 text-xs">
                    A análise técnica de riscos foi concluída com sucesso!
                  </p>
                  <p className="text-slate-500 text-[11px] mt-1">
                    A geração da imagem segura correspondente está aguardando a liberação de créditos para modelos de imagem na API da OpenAI.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <img 
                    src={result.generatedImage} 
                    className="w-full h-auto rounded-2xl border border-slate-800 shadow-lg" 
                    alt="Cenário Seguro Gerado" 
                  />
                  <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest block pt-1">
                    Proposta visual gerada por Inteligência Artificial
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </main>
  );
}