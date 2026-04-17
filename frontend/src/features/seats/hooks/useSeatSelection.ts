"use client";

import { useMemo, useState } from "react";
import { SeatMapItem } from "@/features/seats/types/seat.types";

export const useSeatSelection = (seats: SeatMapItem[]) => {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

  const selectedSeats = useMemo(() => {
    return seats.filter((seat) => selectedSeatIds.includes(seat.id));
  }, [seats, selectedSeatIds]);

  const totalAmount = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + seat.finalPrice, 0);
  }, [selectedSeats]);

  const toggleSeat = (seat: SeatMapItem) => {
    const isAlreadySelected = selectedSeatIds.includes(seat.id);

    if (!isAlreadySelected && seat.status !== "AVAILABLE") {
      return;
    }

    setSelectedSeatIds((prev) =>
      isAlreadySelected
        ? prev.filter((id) => id !== seat.id)
        : [...prev, seat.id],
    );
  };

  const clearSelectedSeats = () => {
    setSelectedSeatIds([]);
  };

  return {
    selectedSeatIds,
    selectedSeats,
    totalAmount,
    toggleSeat,
    clearSelectedSeats,
  };
};