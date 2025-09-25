import { createLoader, parseAsString } from "nuqs/server";

export const filtersSearchParams = {
  title: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  genre: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
};

export const loadSearchParams = createLoader(filtersSearchParams);
