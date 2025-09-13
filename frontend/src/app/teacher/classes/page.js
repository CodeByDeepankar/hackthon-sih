"use client";
import { Card, CardContent } from "@teacher/components/ui/card";
import { Input } from "@teacher/components/ui/input";

const grades = ["Select Class (6–12)", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"]; 

export default function ClassesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-white/90 font-semibold text-2xl mb-4">Classes</div>
      <Card className="bg-white/95 border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <select className="bg-white border rounded-md px-3 py-2 text-sm">
              {grades.map((g)=> <option key={g}>{g}</option>)}
            </select>
            <select className="bg-white border rounded-md px-3 py-2 text-sm">
              <option>—</option>
            </select>
            <Input placeholder="Search students or progress..." className="bg-white" />
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-white grid place-items-center h-40 text-center">
            <div>
              <div className="text-4xl mb-2">👥</div>
              <div className="font-medium">Select a Grade to Begin</div>
              <div className="text-sm text-slate-500">Choose a grade level (6–12) to explore a class’s STEM details and student progress.</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
