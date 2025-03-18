import Head from 'next/head';
import { useState, useEffect } from 'react';
import IVVADForm from '../components/IVVADForm';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>IVVAD - Índice de Vulnerabilidade à Violência Algorítmica Desenvolvimental</title>
        <meta name="description" content="Formulário para avaliação do Índice de Vulnerabilidade à Violência Algorítmica Desenvolvimental" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-10 px-4">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <IVVADForm />
        )}
      </main>

      <footer className="py-6 text-center text-gray-500">
        <p>IVVAD - Todos os direitos reservados © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}