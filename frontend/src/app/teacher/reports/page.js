"use client";
import { useMemo } from "react";
import { Card, CardContent } from "@teacher/components/ui/card";
import { Button } from "@teacher/components/ui/button";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

const KPI = [
  { label: "STEM Students", value: 238, delta: "+2.8%" },
  { label: "STEM Completion", value: "84%", delta: "+6.1%" },
  { label: "STEM Avg Score", value: "84%", delta: "+2.4%" },
  { label: "STEM Excellence", value: 52, note: "Students >80%" },
];

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]; // green, blue, amber, red

export default function ReportsPage() {
  const trend = useMemo(() => [
    { month: "Jan", progress: 72 },
    { month: "Feb", progress: 74 },
    { month: "Mar", progress: 77 },
    { month: "Apr", progress: 80 },
    { month: "May", progress: 82 },
    { month: "Jun", progress: 85 },
  ], []);

  const dist = useMemo(() => [
    { name: "Excellent (80-100%)", value: 52 },
    { name: "Good (60-79%)", value: 145 },
    { name: "Fair (40-59%)", value: 32 },
    { name: "Needs Help (<40%)", value: 9 },
  ], []);

  const weekly = useMemo(() => [
    { day: "Mon", groupA: 210, groupB: 195, groupC: 160 },
    { day: "Tue", groupA: 230, groupB: 210, groupC: 190 },
    { day: "Wed", groupA: 220, groupB: 205, groupC: 175 },
    { day: "Thu", groupA: 240, groupB: 225, groupC: 200 },
    { day: "Fri", groupA: 250, groupB: 235, groupC: 215 },
    { day: "Sat", groupA: 120, groupB: 100, groupC: 80 },
    { day: "Sun", groupA: 100, groupB: 85, groupC: 75 },
  ], []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-white/90 font-semibold text-2xl mb-4">Reports</div>
      <Card className="bg-white/95 border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-md bg-violet-100 text-violet-700 text-sm">STEM Overview</div>
              <div className="px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-sm">This Month</div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="bg-white">Export PDF</Button>
              <Button variant="outline" className="bg-white">Export CSV</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
            {KPI.map((k) => (
              <Card key={k.label} className="bg-white border-slate-200">
                <CardContent className="p-3">
                  <div className="text-xs text-slate-500">{k.label}</div>
                  <div className="text-2xl font-semibold">{k.value}</div>
                  <div className="text-xs text-blue-600">{k.delta || k.note}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-white border-slate-200 mb-4">
            <CardContent className="p-4">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Area type="monotone" dataKey="progress" stroke="#06b6d4" fill="#06b6d433" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie dataKey="value" data={dist} cx="50%" cy="50%" outerRadius={90} label>
                        {dist.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weekly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip />
                      <Line type="monotone" dataKey="groupA" stroke="#10b981" dot />
                      <Line type="monotone" dataKey="groupB" stroke="#3b82f6" dot />
                      <Line type="monotone" dataKey="groupC" stroke="#f59e0b" dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
