import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import Head from 'next/head';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [responses, setResponses] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError('Erro ao fazer login: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const fetchResponses = async () => {
    try {
      const db = getFirestore();
      const responsesRef = collection(db, 'ivvadResponses');
      const q = query(responsesRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        });
      });
      
      setResponses(data);
    } catch (error) {
      console.error('Erro ao buscar respostas:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchResponses();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Head>
          <title>IVVAD Admin - Login</title>
        </Head>
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Login do Administrador
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 p-4 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Senha</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>IVVAD Admin - Painel</title>
      </Head>
      
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Painel Administrativo IVVAD
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sair
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-xl font-semibold mb-4">Respostas do Formulário ({responses.length})</h2>
          
          {responses.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <p>Nenhuma resposta encontrada ainda.</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {responses.map((response) => (
                      <li key={response.id}>
                        <button
                          onClick={() => setSelectedResponse(response)}
                          className={`w-full text-left px-4 py-4 hover:bg-gray-50 ${selectedResponse?.id === response.id ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">IVVAD: {response.scores.ivvadIndex}%</span>
                            <span className="text-sm text-gray-500">
                              {response.timestamp ? new Date(response.timestamp).toLocaleString() : 'Data desconhecida'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {response.scores.vulnerabilityLevel}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="md:w-2/3">
                {selectedResponse ? (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Detalhes da Resposta</h3>
                    
                    <div className="mb-6">
                      <span className="text-sm text-gray-500">Data: {selectedResponse.timestamp ? new Date(selectedResponse.timestamp).toLocaleString() : 'Data desconhecida'}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-3 bg-blue-50 rounded">
                        <div className="font-medium">Fatores Individuais:</div>
                        <div className="text-xl">{selectedResponse.scores.individualTotal}</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded">
                        <div className="font-medium">Fatores Sociais:</div>
                        <div className="text-xl">{selectedResponse.scores.socialTotal}</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded">
                        <div className="font-medium">Educação Digital:</div>
                        <div className="text-xl">{selectedResponse.scores.educationTotal}</div>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded">
                        <div className="font-medium">Supervisão Parental:</div>
                        <div className="text-xl">{selectedResponse.scores.supervisionTotal}</div>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-lg font-semibold mb-2">Índice IVVAD:</div>
                      <div className="text-3xl font-bold mb-2">{selectedResponse.scores.ivvadIndex}%</div>
                      <div className="h-4 w-full bg-gray-200 rounded-full">
                        <div 
                          className={`h-4 rounded-full ${
                            parseFloat(selectedResponse.scores.ivvadIndex) <= 20 ? 'bg-green-500' :
                            parseFloat(selectedResponse.scores.ivvadIndex) <= 50 ? 'bg-yellow-500' :
                            parseFloat(selectedResponse.scores.ivvadIndex) <= 75 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(parseFloat(selectedResponse.scores.ivvadIndex), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="font-medium">Nível de Vulnerabilidade:</div>
                      <div className={`text-lg font-semibold ${
                        parseFloat(selectedResponse.scores.ivvadIndex) <= 20 ? 'text-green-600' :
                        parseFloat(selectedResponse.scores.ivvadIndex) <= 50 ? 'text-yellow-600' :
                        parseFloat(selectedResponse.scores.ivvadIndex) <= 75 ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {selectedResponse.scores.vulnerabilityLevel}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="font-medium">Sugestão de Intervenção:</div>
                      <div className="text-lg">{selectedResponse.scores.interventionSuggestion}</div>
                    </div>
                    
                    <div className="mt-8">
                      <h4 className="font-semibold mb-2">Respostas Detalhadas:</h4>
                      
                      <div className="mb-4">
                        <h5 className="font-medium text-blue-600">Fatores Individuais</h5>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-sm overflow-auto">
                          {JSON.stringify(selectedResponse.individualFactors, null, 2)}
                        </pre>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-medium text-green-600">Fatores Sociais</h5>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-sm overflow-auto">
                          {JSON.stringify(selectedResponse.socialFactors, null, 2)}
                        </pre>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-medium text-purple-600">Educação Digital</h5>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-sm overflow-auto">
                          {JSON.stringify(selectedResponse.digitalEducation, null, 2)}
                        </pre>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-medium text-yellow-600">Supervisão Parental</h5>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-sm overflow-auto">
                          {JSON.stringify(selectedResponse.parentalSupervision, null, 2)}
                        </pre>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => window.print()}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Imprimir
                    </button>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-lg shadow text-center">
                    <p className="text-gray-500">Selecione uma resposta para ver os detalhes</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}