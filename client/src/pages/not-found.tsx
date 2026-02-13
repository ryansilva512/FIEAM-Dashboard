import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Página não encontrada</p>
        <Link href="/" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors">
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  );
}
