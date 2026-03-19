"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";

function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 1400);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}

export default function Template({ children }) {
  const pathname = usePathname();

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait" initial={false}>
        <div key={pathname}>{children}</div>
      </AnimatePresence>
    </>
  );
}
