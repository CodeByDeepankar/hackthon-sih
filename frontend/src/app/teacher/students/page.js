"use client";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@teacher/components/ui/card";
import { Input } from "@teacher/components/ui/input";
import { Badge } from "@teacher/components/ui/badge";
import { Avatar, AvatarFallback } from "@teacher/components/ui/avatar";

const classes = [
  "All Classes",
  "Grade 6A - Mathematics",
  "Grade 6A - Science",
  "Grade 7A - Mathematics",
  "Grade 7A - Science",
  "Grade 8A - Technology",
  "Grade 9A - Engineering",
  "Grade 10A - Advanced Mathematics",
  "Grade 11A - Advanced Science",
  "Grade 12A - Advanced Engineering",
];

const data = [
  { name: "Sarah Mitchell", grade: "Grade 6 STEM", progress: 85, lessons: "38/45", avg: 81, activity: "Algebra Problem Sets" },
  { name: "James Kumar", grade: "Grade 6 STEM", progress: 72, lessons: "32/45", avg: 72, activity: "Geometry Fundamentals" },
  { name: "Emily Chen", grade: "Grade 7 STEM", progress: 91, lessons: "40/44", avg: 87, activity: "Algebra II Progress" },
  { name: "David Rodriguez", grade: "Grade 8 STEM", progress: 58, lessons: "22/38", avg: 64, activity: "Pre-Algebra Review" },
  { name: "Alex Thompson", grade: "Grade 9 STEM", progress: 87, lessons: "37/40", avg: 79, activity: "Trigonometry" },
  { name: "Maya Patel", grade: "Grade 10 STEM", progress: 93, lessons: "32/36", avg: 88, activity: "Calculus Introduction" },
];

function StudentCard({ s }) {
  return (
    <Card className="bg-white/95 border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar><AvatarFallback>{s.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</AvatarFallback></Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="font-medium text-slate-900 truncate">{s.name}</div>
              <Badge className="bg-violet-600 text-white">{s.progress}%</Badge>
            </div>
            <div className="text-xs text-slate-500 mb-2">{s.grade}</div>
            <div className="text-sm text-slate-700 flex items-center gap-6">
              <span>Lessons <b>{s.lessons}</b></span>
              <span>Avg Score <span className="text-emerald-600 font-semibold">{s.avg}%</span></span>
            </div>
            <div className="text-sm mt-1">Recent Activity <b>{s.activity}</b></div>
            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-violet-600" style={{ width: `${s.progress}%` }} /></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentsPage() {
  const [q, setQ] = useState("");
  const [klass, setKlass] = useState(classes[0]);
  const filtered = useMemo(() => data.filter(s => s.name.toLowerCase().includes(q.toLowerCase())), [q]);
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-white/90 font-semibold text-2xl mb-4">Students</div>
      <Card className="bg-white/95 border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search STEM students..." className="bg-white" />
            <div className="relative">
              <select value={klass} onChange={(e)=>setKlass(e.target.value)} className="bg-white border rounded-md px-3 py-2 text-sm">
                {classes.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((s)=> <StudentCard key={s.name} s={s} />)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
