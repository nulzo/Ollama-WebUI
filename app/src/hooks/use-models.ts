import {keepPreviousData, useQuery} from "@tanstack/react-query";
import {Ollama} from "@/services/ollama";

const ollama: Ollama = new Ollama({
  endpoint: "/api/",
  host: "http://127.0.0.1",
  port: 11434,
});

export function useModels() {
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

