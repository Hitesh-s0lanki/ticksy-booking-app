import { parseAsString, useQueryStates } from "nuqs";

export const useEventsFilters = () => {
  return useQueryStates({
    title: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    eventType: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    categoryType: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  });
};
