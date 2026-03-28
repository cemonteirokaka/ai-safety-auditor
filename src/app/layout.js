import './globals.css'; // ESTA LINHA É FUNDAMENTAL

export const metadata = {
  title: 'Assistente de Segurança (Projeto Integrador - Univesp)',
  description: 'Auditoria de Riscos com IA',
  icons: {
    icon: '/favicon.ico', // ADICIONE APENAS ESTA LINHA
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body className="bg-slate-950">{children}</body>
    </html>
  )
}