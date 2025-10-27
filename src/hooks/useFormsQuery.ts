import { useQuery } from "@tanstack/react-query";
import { getForms } from "../api/formsApi";
import { Form } from "../utils/interfaces";

export function useGetFormsQuery() {
  return useQuery<Form[], Error>({
    queryKey: ["forms"],
    queryFn: async (): Promise<Form[]> => {
      const forms = await getForms();
      return forms;
    },
  });
}
