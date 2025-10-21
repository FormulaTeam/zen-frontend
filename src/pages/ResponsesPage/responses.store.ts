import { create } from "zustand";
import { Form } from "../../utils/interfaces";

interface ResponsesState {}

export const useResponsesStore = create<ResponsesState>((set) => ({}));
