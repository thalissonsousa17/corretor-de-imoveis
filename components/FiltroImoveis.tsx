import React from "react";

interface FiltroImoveisProps {
  search: string;
  onSearchChange: (value: string) => void;
  onFilterclick?: () => void;
}

const FiltroImoveis: React.FC<FiltroImoveisProps> = ({ search, onSearchChange }) => {
  return (
    <div className="flex flex-col sm:flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
      {/* Input busca */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center ps-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 
                  3.476l4.817 4.817a1 1 0 01-1.414 
                  1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Busca imóveis..."
        className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

export default FiltroImoveis;
