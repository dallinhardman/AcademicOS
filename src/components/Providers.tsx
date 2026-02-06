"use client";

import { AcademicProvider } from "@/context/AcademicContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AcademicProvider>{children}</AcademicProvider>;
}
