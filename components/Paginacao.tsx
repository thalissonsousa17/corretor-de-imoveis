import React from "react";

interface PaginacaoProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Paginacao: React.FC<PaginacaoProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => currentPage > 1 && onPageChange(currentPage - 1);
  const handleNext = () => currentPage < totalPages && onPageChange(currentPage + 1);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxButtons = 5;

    if (totalPages <= maxButtons + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const left = Math.max(2, currentPage - 1);
      const right = Math.min(totalPages - 1, currentPage + 1);

      pages.push(1);
      if (left > 2) pages.push("…");

      for (let i = left; i <= right; i++) pages.push(i);

      if (right < totalPages - 1) pages.push("…");
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md bg-gray-800 text-white disabled:opacity-90 hover:bg-gray-700"
      >
        ←
      </button>

      {getPageNumbers().map((page, idx) =>
        typeof page === "number" ? (
          <button
            key={idx}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition ${
              currentPage === page
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {page}
          </button>
        ) : (
          <span key={idx} className="px-2 text-gray-500">
            {page}
          </span>
        )
      )}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md bg-gray-800 text-white disabled:opacity-40 hover:bg-gray-700"
      >
        →
      </button>
    </div>
  );
};

export default Paginacao;
