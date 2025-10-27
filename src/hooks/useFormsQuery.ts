import { useQuery } from "@tanstack/react-query";
import { getForms } from "../api/formsApi";
import { Form } from "../utils/interfaces";
import { useFetch } from "../utils/useFetch";

export function useGetFormsQuery() {
  return useFetch<undefined, Form[]>({
    queryKey: () => ["forms"],
    endpoint: "/forms/get-forms",
  });
}
