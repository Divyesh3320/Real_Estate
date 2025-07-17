import React, { useState } from "react";


function Buy() {
  // Sample data for dynamic cards
  const cardData = [
    { title: "Card 1", content: "This is card 1 content." },
    { title: "Card 2", content: "This is card 2 content." },
    { title: "Card 3", content: "This is card 3 content." },
    { title: "Card 4", content: "This is card 4 content." },
    { title: "Card 5", content: "This is card 5 content." },
    { title: "Card 6", content: "This is card 6 content." },
    { title: "Card 7", content: "This is card 7 content." },
    { title: "Card 8", content: "This is card 8 content." },
    { title: "Card 9", content: "This is card 9 content." },
    { title: "Card 10", content: "This is card 1 content." },
    { title: "Card 11", content: "This is card 2 content." },
    { title: "Card 12", content: "This is card 3 content." },
    { title: "Card 13", content: "This is card 4 content." },
    { title: "Card 14", content: "This is card 5 content." },
    { title: "Card 15", content: "This is card 6 content." },
    { title: "Card 16", content: "This is card 7 content." },
    { title: "Card 17", content: "This is card 8 content." },
    { title: "Card 18", content: "This is card 9 content." },
  ];

  const cardsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the cards to display for the current page
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentCards = cardData.slice(startIndex, endIndex);

  // Handlers for navigation
  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage * cardsPerPage < cardData.length) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Buy</h1>
      <div className="row g-4">
        {currentCards.map((card, index) => (
          <div className="col-md-4" key={index}>
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{card.title}</h5>
                <p className="card-text">{card.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="d-flex justify-content-center mt-4">
        <button
          className="btn btn-primary me-2"
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={endIndex >= cardData.length}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Buy;
