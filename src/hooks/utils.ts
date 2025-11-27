import React from "react";

export function useNumberFormat(
  locales: string | string[],
  options?: Intl.NumberFormatOptions,
) {
  return React.useMemo(
    () => Intl.NumberFormat(locales, options),
    [locales, options],
  );
}
