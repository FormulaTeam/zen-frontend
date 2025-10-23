import { create } from "zustand";
import { Form, ResponseForm } from "../../utils/interfaces";

interface ResponsesState {
  responses: ResponseForm[] | null;
  setResponses: (responses: ResponseForm[] | null) => void;
  responsesCount: number;
  setResponsesCount: (count: number) => void;
}

export const useResponsesStore = create<ResponsesState>((set) => ({
  responses: null,
  setResponses: (responses) => set({ responses }),
  responsesCount: 0,
  setResponsesCount: (count) => set({ responsesCount: count }),
}));
