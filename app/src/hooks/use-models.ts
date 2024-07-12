import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Ollama } from "@/services/ollama";

export function useModels(ollama: Ollama) {
  const data = useQuery({
    queryKey: ["models"],
    queryFn: () => ollama.list(),
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });
  if (data) {
    return data;
  }
}
