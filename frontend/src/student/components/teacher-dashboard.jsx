import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Users, BookOpen, TrendingUp, Award, Calendar, Clock, Target, AlertCircle, CheckCircle, BarChart3, PlusCircle, Bell, MessageSquare, GraduationCap, ChevronRight } from "lucide-react";

export function TeacherDashboard({ teacher, onNavigate }) { const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  const classStats = [
    {
      name: "Grade 5A", students: 28, activeToday: 24, avgProgress: 78, needsAttention: 3 },
    { name: "Grade 5B", students: 25, activeToday: 22, avgProgress: 82, needsAttention: 2 },
    { name: "Grade 6A", students: 30, activeToday: 26, avgProgress: 75, needsAttention: 4 }
  ];

  const recentActivity = [
    { student: "Maya Patel", action: "Completed Math Quiz", score: "95%", time: "2 hours ago", subject: "Mathematics" },
    { student: "Ahmad Ibrahim", action: "Finished Science Lesson", score: "✓ Complete", time: "3 hours ago", subject: "Science" },
    { student: "Sarah Johnson", action: "Submitted Assignment", score: "Pending", time: "4 hours ago", subject: "Language Arts" },
    { student: "Carlos Rivera", action: "Needs Help with Math", score: "Help Needed", time: "5 hours ago", subject: "Mathematics" }
  ];

  const upcomingTasks = [
    { task: "Review Science Assignments", dueDate: "Today, 4:00 PM", priority: "high", count: 23 },
    { task: "Weekly Progress Reports", dueDate: "Tomorrow, 9:00 AM", priority: "medium", count: 3 },
    { task: "Parent-Teacher Meetings", dueDate: "Friday, 2:00 PM", priority: "low", count: 5 }
  ];

  const totalActiveStudents = classStats.reduce((sum, cls) => sum + cls.activeToday, 0);
  const totalStudents = classStats.reduce((sum, cls) => sum + cls.students, 0);
  const avgClassProgress = Math.round(classStats.reduce((sum, cls) => sum + cls.avgProgress, 0) / classStats.length);
  const totalNeedsAttention = classStats.reduce((sum, cls) => sum + cls.needsAttention, 0);

  const getPriorityColor = (priority: string) => { switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200'; }
  };

  return (
    <div className="space-y-6">
      { /* Welcome Header */ }
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-2">Welcome back, { teacher.name }!</h1>
            <p className="opacity-90">{ teacher.school } • Managing { teacher.classes } classes</p>
          </div>
          <div className="text-right">
            <div className="text-3xl mb-1">{ totalActiveStudents }</div>
            <p className="text-sm opacity-90">Students active today</p>
          </div>
        </div>
      </div>

      { /* Quick Stats */ }
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl mb-1">{ totalStudents }</p>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl mb-1">{ avgClassProgress }%</p>
            <p className="text-sm text-muted-foreground">Avg Progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl mb-1">24</p>
            <p className="text-sm text-muted-foreground">Lessons Assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl mb-1">{ totalNeedsAttention }</p>
            <p className="text-sm text-muted-foreground">Need Attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        { /* Class Overview */ }
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Class Overview
                </CardTitle>
                <Button variant="outline" size="sm" onClick={ () => onNavigate('classes') }>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                { classStats.map((classData, index) => (
                  <div key={index } className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{ classData.name }</h4>
                        <p className="text-sm text-muted-foreground">
                          { classData.students } students • { classData.activeToday } active today
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={ classData.needsAttention > 0 ? "destructive" : "secondary" }>
                          { classData.needsAttention > 0 ? `${classData.needsAttention } need help` : 'All good'}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Class Average Progress</span>
                        <span>{ classData.avgProgress }%</span>
                      </div>
                      <Progress value={ classData.avgProgress } className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          { /* Recent Activity */ }
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Student Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                { recentActivity.map((activity, index) => (
                  <div key={index } className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{ activity.student.split(' ').map(n => n[0]).join('') }</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{ activity.student }</p>
                      <p className="text-sm text-muted-foreground">{ activity.action }</p>
                      <p className="text-xs text-muted-foreground">{ activity.time }</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">
                        { activity.subject }
                      </Badge>
                      <p className={ `text-sm ${
                        activity.score === 'Help Needed' ? 'text-red-600' :
                        activity.score === 'Pending' ? 'text-yellow-600' : 'text-green-600' }`}>
                        { activity.score }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        { /* Sidebar */ }
        <div className="space-y-6">
          { /* Quick Actions */ }
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" onClick={ () => onNavigate('create-assignment') }>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Assignment
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={ () => onNavigate('analytics') }>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={ () => onNavigate('messages') }>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message Parents
                </Button>
              </div>
            </CardContent>
          </Card>

          { /* Upcoming Tasks */ }
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                { upcomingTasks.map((task, index) => (
                  <div key={index } className={ `p-3 border rounded-lg ${getPriorityColor(task.priority) }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{ task.task }</p>
                        <p className="text-xs opacity-75 mt-1">{ task.dueDate }</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        { task.count }
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          { /* Performance Summary */ }
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                This Week's Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl text-green-600 mb-1">87%</div>
                  <p className="text-sm text-green-800">Students completed assignments</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Top performing class:</span>
                    <span className="font-medium">Grade 5B</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Most improved student:</span>
                    <span className="font-medium">Ahmad Ibrahim</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Assignments graded:</span>
                    <span className="font-medium">45/52</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      { /* Student Spotlight */ }
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Student Spotlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  <AvatarFallback>MP</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Maya Patel</p>
                  <p className="text-sm text-muted-foreground">Grade 5A</p>
                </div>
              </div>
              <p className="text-sm text-yellow-800">🏆 Top scorer in Math quiz with 95%</p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Ahmad Ibrahim</p>
                  <p className="text-sm text-muted-foreground">Grade 6A</p>
                </div>
              </div>
              <p className="text-sm text-blue-800">📈 Most improved this week (+25% progress)</p>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Grade 5B</p>
                </div>
              </div>
              <p className="text-sm text-green-800">🔥 20-day learning streak maintained</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}