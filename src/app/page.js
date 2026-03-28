'use client';

import { useState } from 'react';
import { UploadCloud, Zap, Loader2, Lock, Trash2 } from 'lucide-react';

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
    // Alerta de demonstração para falta de créditos
    alert("Saldo de créditos insuficiente. Por favor, verifique com o administrador do grupo.");
    return;

    // O código abaixo fica "desativado" pelo return acima, mas preservado para quando houver créditos
    if (!base64Image) return;
    setLoading(true);
    setError(null);
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
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden text-white">
      
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
              <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full">
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
    </main>
  );
}