import React from 'react';

interface StarRatingProps {
  rating: number | null;
  setRating: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, setRating }) => {
  const handleStarClick = (star: number) => {
    setRating(star);
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          onClick={() => handleStarClick(star)}
          xmlns="http://www.w3.org/2000/svg"
          fill={star <= (rating || 0) ? 'gold' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
          className="w-6 h-6 cursor-pointer"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
          />
        </svg>
      ))}
    </div>
  );
};

export default StarRating;
