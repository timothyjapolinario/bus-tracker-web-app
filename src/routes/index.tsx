import { lazy, Suspense } from "react";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";

const BusMap = lazy(() =>
  import("../components/BusMap").then((module) => ({
    default: module.BusMap,
  })),
);

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="flex h-screen flex-col bg-slate-50">
      <header className="z-[1000] flex items-center justify-between bg-white px-5 py-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">BusTracker</h1>
          <p className="text-sm text-slate-500">Live bus tracking</p>
        </div>
      </header>

      <section className="z-[1000] bg-white px-5 py-3 shadow-sm">
        <h2 className="font-semibold text-slate-900">Bus 001</h2>
        <p className="text-sm text-slate-500">Route A · Rizal - Cabanatuan</p>
      </section>

      <section className="min-h-0 flex-1">
        <ClientOnly fallback={<div className="h-full w-full" />}>
          <Suspense fallback={<div className="h-full w-full" />}>
            <BusMap />
          </Suspense>
        </ClientOnly>
      </section>
    </main>
  );
}
