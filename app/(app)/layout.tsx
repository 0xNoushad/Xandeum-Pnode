import { Sidebar } from "@/components/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-zinc-950">
      <div className="flex md:flex-row min-h-screen min-h-[100dvh]">
        <Sidebar />
        {/* Main content - pt-14 on mobile for fixed header, pt-0 on desktop */}
        <main className="flex-1 w-full bg-zinc-950 pt-14 md:pt-0">
          <div className="p-4 sm:p-6 md:p-8 pb-20 md:pb-8 max-w-[1600px] mx-auto safe-area-bottom">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
