import create from "zustand";

type Seat = {
    id: number;
    isFull: boolean;
    tooltip: string | null;
};

type SeatStoreState = {
    seats: Seat[];
    selectedSeats: number[];
    setSeats: (seats: Seat[]) => void;
    setSelectedSeats: (seats: number[]) => void;
};

export const useSeatStore = create<SeatStoreState>((set) => ({
    seats: [],
    selectedSeats: [],
    setSeats: (seats) => set({ seats }),
    setSelectedSeats: (seats) => set({ selectedSeats: seats }),
}));
