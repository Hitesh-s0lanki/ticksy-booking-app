import { createLoader, parseAsString } from "nuqs/server";

export const filtersSearchParams = {
  source: parseAsString
    .withDefault("movie")
    .withOptions({ clearOnDefault: true }),
};

export const loadSearchParams = createLoader(filtersSearchParams);
