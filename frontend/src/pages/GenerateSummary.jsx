import ExecutiveSummaryForm from "../components/ExecutiveSummaryForm";

export default function GenerateSummary() {
  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale-[0.2] opacity-40"
        style={{ backgroundImage: 'url("/bg-ai.png")' }}
      />
      <div className="absolute inset-0 z-0 bg-white/40" />

      <div className="relative z-10 container max-w-7xl mx-auto">
        <ExecutiveSummaryForm />
      </div>
    </main>
  );
}


