import { useQuery } from "@tanstack/react-query";
import { getForms } from "../api/formsApi";
import { getResponsesCount } from "../api/responsesApi";
import { Form } from "../utils/interfaces";

export function useFormsQuery() {
  return useQuery<Form[], Error>({
    queryKey: ["forms"],
    queryFn: async (): Promise<Form[]> => {
      const forms = await getForms();

      const formsWithCounts: Form[] = await Promise.all(
        forms.map(async (form) => {
          try {
            const count = await getResponsesCount(form.id);
            return { ...form, numberOfResponses: count?.count ?? 0 } as Form;
          } catch (error) {
            console.error(`Failed to get count for form ${form.id}:`, error);
            return { ...form, numberOfResponses: 0 } as Form;
          }
        }),
      );

      return formsWithCounts;
    },
    staleTime: 0,
    refetchOnMount: "always",
  });
}
