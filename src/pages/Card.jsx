import React, { useState } from "react";

export   function Card() {
  const [showCard, setShowCard] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Link */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setShowCard(true);
        }}
        className="text-blue-600 dark:text-blue-400 absolute underline text-lg mb-6 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
      >
        Show Card
      </a>

      {/* Card */}
      {showCard && (
        <div className="max-w w-full bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50 rounded-xl p-6 animate-fade-in border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Card Title</h2>
          <p className="text-gray-600 dark:text-gray-400">
            This card appeared on the same page after clicking the link.
          </p>
          <button
            onClick={() => setShowCard(false)}
            className="mt-4 px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
