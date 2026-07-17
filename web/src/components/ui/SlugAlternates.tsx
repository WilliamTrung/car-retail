"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Alternates = Partial<Record<"vi" | "en", string>>;

type Ctx = {
  alternates: Alternates | null;
  setAlternates: (a: Alternates | null) => void;
};

const SlugAlternatesContext = createContext<Ctx | null>(null);

/** Mounted once in the locale layout, above header + page. */
export function SlugAlternatesProvider({ children }: { children: ReactNode }) {
  const [alternates, setAlternates] = useState<Alternates | null>(null);
  return (
    <SlugAlternatesContext.Provider value={{ alternates, setAlternates }}>
      {children}
    </SlugAlternatesContext.Provider>
  );
}

/** Per-locale slugs for the current page, or null when not registered. */
export function useSlugAlternates(): Alternates | null {
  return useContext(SlugAlternatesContext)?.alternates ?? null;
}

/**
 * Rendered by detail pages whose dynamic slug differs per locale (news).
 * Registers the counterpart slugs so LangSwitcher links to the right URL.
 */
export function SlugAlternates({ vi, en }: Alternates) {
  const setAlternates = useContext(SlugAlternatesContext)?.setAlternates;
  useEffect(() => {
    setAlternates?.({ vi, en });
    return () => setAlternates?.(null);
  }, [setAlternates, vi, en]);
  return null;
}
