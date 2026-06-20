import React from 'react';

/**
 * Pagination Component
 * 
 * A stateless component that renders navigation controls.
 * 
 * @param {Object} props
 * @param {number} props.page - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {function} props.onPageChange - Callback function triggered on page click
 */
const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const isPrevDisabled = page <= 1;
  const isNextDisabled = page >= totalPages;

  return (
    <div className="flex items-center justify-center space-x-4 py-4">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={isPrevDisabled}
        className={`px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          isPrevDisabled ? 'opacity-40 cursor-not-allowed hover:bg-white' : ''
        }`}
      >
        ← Prev
      </button>
      
      <span className="text-sm text-gray-700 font-medium select-none">
        Page {page} of {totalPages}
      </span>
      
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={isNextDisabled}
        className={`px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          isNextDisabled ? 'opacity-40 cursor-not-allowed hover:bg-white' : ''
        }`}
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
