import React, { useState } from "react";

export   function Card() {
  const [showCard, setShowCard] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Link */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setShowCard(true);
        }}
        className="text-blue-600 absolute underline text-lg mb-6 hover:text-blue-800 transition-colors"
      >
        Show Card
      </a>

      {/* Card */}
      {showCard && (
        <div className="max-w w-full  bg-black shadow-lg rounded-xl p-6 animate-fade-in">
          <h2 className="text-xl font-bold mb-2">Card Title</h2>
          <p className="text-gray-600">
            This card appeared on the same page after clicking the link.
          </p>
          <button
            onClick={() => setShowCard(false)}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
