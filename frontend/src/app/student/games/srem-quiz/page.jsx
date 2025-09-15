import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "STEM Quiz (alias)",
  description: "Science & Technology Quiz (alias route)",
};

export default function SremQuizAliasPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <div className="h-14 flex items-center gap-3 px-4 border-b bg-background">
        <Link
          href="/student/games"
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Games</span>
        </Link>
        <h1 className="text-base font-semibold ml-2">Science & Technology Quiz</h1>
      </div>
      <iframe
        src="/games/stemquiz.html"
        title="Science and Technology Quiz"
        className="w-full h-[calc(100vh-56px)]"
        style={{ border: "0" }}
      />
    </div>
  );
}
