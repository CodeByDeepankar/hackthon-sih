export const metadata = {
  title: "🧪 STEM Quiz",
  description: "Play the STEM Quiz",
};

export default function GamesHub() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
  <h1 className="text-xl font-semibold mb-4">🧪 STEM Quiz</h1>
        <div className="rounded-lg overflow-hidden border bg-white dark:bg-neutral-900 shadow">
          <iframe
            src="/games/stemquiz.html"
            title="STEM Quiz"
            className="w-full h-[80vh]"
            style={{ border: "0" }}
          />
        </div>
      </div>
    </div>
  );
}
