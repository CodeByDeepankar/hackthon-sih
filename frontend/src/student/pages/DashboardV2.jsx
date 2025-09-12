import { BookOpen, Shield, Flame, Star, Gift, Trophy } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { useUser } from '@clerk/nextjs';

export default function DashboardV2({ user = {} }) {
  const { user: clerkUser } = useUser();
  const name = clerkUser?.fullName || clerkUser?.firstName || user.name || 'Student';

  return (
    <div className="min-h-screen pb-10">
      {/* Header is provided by the global app layout; no local profile button here */}

      {/* Header strip with small badges */}
      <div className="max-w-7xl mx-auto px-4 pt-4 grid gap-3 md:grid-cols-3">
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">7 Day Streak</div>
          <div className="px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-200">2150 XP</div>
          <div className="px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium border border-green-200">Level 10</div>
        </div>
  <div className="hidden md:flex items-center justify-center text-xs text-foreground/70">Updated 1 min ago</div>
        <div className="hidden md:flex items-center justify-end gap-2" />
      </div>

      {/* Big welcome banner */}
      <div className="max-w-7xl mx-auto px-4 mt-3">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white shadow">
          <div className="relative z-10">
            <p className="text-sm opacity-90 mb-1">Welcome to GyanaRatna</p>
            <h1 className="text-2xl sm:text-3xl font-semibold">Continue Your Learning Journey, {name}!</h1>
            <p className="opacity-90 text-sm max-w-xl mt-2">Discover new knowledge, complete challenges, and unlock achievements. Your next adventure in learning awaits!</p>
            <div className="mt-4 flex items-center gap-2">
              <Button className="bg-white text-black hover:bg-white/90">Continue Learning</Button>
              <div className="text-xs text-gray-200">Recent: Algebra • 62%</div>
            </div>
          </div>
          <div className="absolute right-4 top-4 opacity-20">
            <BookOpen size={80} />
          </div>
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full" />
        </div>
      </div>

      {/* Today challenge card */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 grid place-items-center text-lg">🧮</div>
                <div>
                  <div className="text-sm text-foreground/70">Today's Challenge</div>
                  <div className="font-medium">Math Master</div>
                  <div className="text-xs text-foreground/70">2/3 completed</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-28">
                  <Progress value={66} className="h-2" />
                </div>
                <Button size="sm" className="light:text-black">Continue</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats row */}
      <div className="max-w-7xl mx-auto px-4 mt-4 grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: 'This Week', value: '4.5 hrs' },
          { label: 'Lessons', value: '12' },
          { label: 'Quizzes', value: '8' },
          { label: 'Streak', value: '18 days' },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4 text-center">
            <div className="text-xs text-foreground/70">{s.label}</div>
            <div className="text-xl font-semibold">{s.value}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Featured courses + recent activity */}
      <div className="max-w-7xl mx-auto px-4 mt-4 grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Featured Courses</div>
              <button className="text-xs text-blue-600">View All</button>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Mathematics', progress: 62, color: 'from-blue-500 to-blue-600' },
                { name: 'Science & Nature', progress: 40, color: 'from-green-500 to-green-600' },
              ].map((c) => (
                <div key={c.name} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.color}`} />
                    <div className="flex-1">
                      <div className="font-medium light:text-black">{c.name}</div>
                      <Progress value={c.progress} className="h-2 mt-2" />
                    </div>
                    <Button size="sm" variant="outline" className="light:text-black">Open</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="font-medium mb-3">Recent Activity</div>
            <div className="space-y-3">
              {[
                { title: 'Algebra Basics', time: '1 hour ago' },
                { title: 'Science Quiz #3', time: '1 day ago' },
                { title: 'Math Whiz Badge', time: '2 days ago' },
              ].map((a) => (
                <div key={a.title} className="p-3 rounded-lg border bg-card flex items-center justify-between">
                  <div>
                    <div className="font-medium light:text-black">{a.title}</div>
                    <div className="text-xs text-foreground/70">{a.time}</div>
                  </div>
                  <Button size="sm" variant="outline" className="light:text-black">View</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="max-w-7xl mx-auto px-4 mt-4 grid md:grid-cols-4 gap-4">
        {[
          { label: 'Browse Courses', icon: <BookOpen className="w-5 h-5" /> },
          { label: 'Take Quiz', icon: <Trophy className="w-5 h-5" /> },
          { label: 'Unlock Reward', icon: <Gift className="w-5 h-5" /> },
          { label: 'Achievements', icon: <Star className="w-5 h-5" /> },
        ].map((q) => (
          <Button key={q.label} variant="outline" className="h-auto py-4 flex items-center justify-center gap-2 light:text-black">
            {q.icon}
            <span>{q.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
