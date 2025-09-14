"use client";

import { useEffect, useMemo, useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from "@clerk/nextjs";
import { fetchUserRole } from "@/lib/users";
import { Card, CardContent, CardHeader, CardTitle } from "@teacher/components/ui/card";
import { Button } from "@teacher/components/ui/button";
import { Badge } from "@teacher/components/ui/badge";
import { Progress } from "@teacher/components/ui/progress";
import { Avatar, AvatarFallback } from "@teacher/components/ui/avatar";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { Users, GraduationCap, BookOpen, LineChart as LineChartIcon, TrendingUp, ChevronRight } from "lucide-react";

const StatCard = ({ icon: Icon, label, value }) => (
  <Card className="bg-white/95 border-slate-200 shadow-sm">
    <CardContent className="p-5">
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-indigo-50 text-indigo-600">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-slate-600 text-sm">{label}</div>
          <div className="text-slate-900 font-semibold text-xl">{value}</div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const StudentChip = ({ name, className, progress }) => (
  <Card className="bg-white/95 border-slate-200 shadow-sm">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-violet-600 text-white">
            {name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="truncate">
              <div className="text-sm font-medium text-slate-900 truncate">{name}</div>
              <div className="text-xs text-slate-500 truncate">{className}</div>
            </div>
            <Badge className="bg-violet-600 text-white">{progress}%</Badge>
          </div>
          <div className="mt-2">
            <Progress value={progress} />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

function DashboardContent() {
  const { user, isSignedIn } = useUser();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!user?.id) return;
        const r = await fetchUserRole(user.id).catch(() => null);
        const roleValue = typeof r === "string" ? r : r?.role;
        if (!mounted) return;
        setRole(roleValue || null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const analytics = useMemo(
    () => [
      { month: "Jan", progress: 62 },
      { month: "Feb", progress: 68 },
      { month: "Mar", progress: 72 },
      { month: "Apr", progress: 76 },
      { month: "May", progress: 80 },
      { month: "Jun", progress: 83 },
    ],
    []
  );

  const subjects = useMemo(
    () => [
      { subject: "Mathematics", avg: 88 },
      { subject: "Science", avg: 82 },
      { subject: "Technology", avg: 74 },
      { subject: "Engineering", avg: 68 },
    ],
    []
  );

  if (!isSignedIn) {
    return (
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    );
  }

  if (!loading && role && role !== "teacher" && role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="text-xl font-semibold mb-2">Access Denied</div>
            <div className="text-slate-600">You need teacher or admin privileges to access this page.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="text-white/90 text-lg font-semibold">STEM Dashboard</div>
          <div className="text-white/80 text-sm">Grades 6–12</div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Card className="lg:col-span-4 bg-white/95 border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-bold text-violet-700">Welcome back, Teacher!</div>
                  <div className="text-slate-600 mt-1">Ready to continue monitoring your STEM students&#39; learning journey?</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: GraduationCap, label: "Classes", desc: "STEM classes and quick actions" },
                  { icon: Users, label: "Students", desc: "Individual STEM progress tracking" },
                  { icon: LineChartIcon, label: "Reports", desc: "STEM analytics and detailed reports" },
                ].map(({ icon: Ico, label, desc }) => (
                  <Card key={label} className="border-slate-200">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-violet-100 text-violet-700">
                          <Ico className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{label}</div>
                          <div className="text-xs text-slate-500">{desc}</div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-violet-700 hover:text-violet-800">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <div className="text-white/90 font-semibold mb-2">STEM Classes Overview</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Students" value={175} />
            <StatCard icon={TrendingUp} label="Active Students" value={166} />
            <StatCard icon={BookOpen} label="Avg Progress" value={"80%"} />
            <StatCard icon={GraduationCap} label="STEM Classes" value={7} />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-white/90 font-semibold">Student Progress Tracking</div>
            <Button variant="outline" className="bg-white/90 border-white text-violet-700 hover:bg-white">
              View All Students
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StudentChip name="Sarah Mitchell" className="Grade 6 • STEM" progress={82} />
            <StudentChip name="James Kumar" className="Grade 6 • STEM" progress={76} />
            <StudentChip name="Emily Chen" className="Grade 7 • STEM" progress={91} />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-white/90 font-semibold">STEM Analytics & Reports</div>
            <Button variant="outline" className="bg-white/90 border-white text-violet-700 hover:bg-white">
              View Full Reports
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-white/95 border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900 text-base">STEM Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip />
                      <Area type="monotone" dataKey="progress" stroke="#7c3aed" fill="url(#colorProgress)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/95 border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900 text-base">STEM Subject Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjects}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="subject" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip />
                      <Bar dataKey="avg" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}

export default function Page() {
  return (
    <>
      <SignedIn>
        <DashboardContent />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

