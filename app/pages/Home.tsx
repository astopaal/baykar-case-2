import React from "react";
import SeatMap from "../components/SeatMap";

export const HomePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Baykar Tech Test Case</h1>
      <SeatMap />
    </div>
  );
};
