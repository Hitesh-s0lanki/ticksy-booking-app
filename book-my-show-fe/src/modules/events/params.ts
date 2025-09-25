import { createLoader, parseAsString } from "nuqs/server";

export const filtersSearchParams = {
  title: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  eventType: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  categoryType: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

export const loadSearchParams = createLoader(filtersSearchParams);
