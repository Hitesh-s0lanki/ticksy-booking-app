import { parseAsString, useQueryStates } from "nuqs";

export const useMoviesFilters = () => {
  return useQueryStates({
    title: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    genre: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  });
};
