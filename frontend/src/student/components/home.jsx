import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { SubHeader } from "./sub-header";
import { BookOpen, Star, TrendingUp, Users, Award, PlayCircle, Clock, Target, Zap, Calendar, ChevronRight, Sparkles } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Home({ user, onNavigate }) { // Today's Challenge
  const todaysChallenge = {
    title: "Math Master", description: "Complete 3 math lessons", progress: user.dailyGoalProgress || 2, target: user.dailyGoalTarget || 3, reward: 100, icon: "🧮" };

  // Featured courses
  const featuredCourses = [
    { id: 'mathematics', title: 'Mathematics', description: 'Master numbers and problem-solving', progress: 65, difficulty: 'Intermediate', imageUrl: 'https://images.unsplash.com/photo-1676302440263-c6b4cea29567?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZHVjYXRpb24lMjBtYXRoZW1hdGljcyUyMGJvb2tzfGVufDF8fHx8MTc1NzMzODM0NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', color: 'from-blue-500 to-blue-600' },
    { id: 'science', title: 'Science & Nature', description: 'Explore the natural world', progress: 40, difficulty: 'Beginner', imageUrl: 'https://images.unsplash.com/photo-1608037222022-62649819f8aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwbGFib3JhdG9yeSUyMGV4cGVyaW1lbnRzfGVufDF8fHx8MTc1NzMzODM0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', color: 'from-green-500 to-green-600' }
  ];

  // Recent activities
  const recentActivities = [
    { type: 'lesson', title: 'Algebra Basics', course: 'Mathematics', timeAgo: '2 hours ago', xp: 50 },
    { type: 'quiz', title: 'Science Quiz #3', course: 'Science', timeAgo: '1 day ago', xp: 80 },
    { type: 'achievement', title: 'Math Whiz Badge', course: 'Mathematics', timeAgo: '2 days ago', xp: 100 }
  ];

  // Study stats
  const studyStats = [
    { label: 'This Week', value: '4.5 hrs', icon: Clock, color: 'text-blue-600' },
    { label: 'Lessons', value: '12', icon: BookOpen, color: 'text-green-600' },
    { label: 'Quizzes', value: '8', icon: Target, color: 'text-purple-600' },
    { label: 'Streak', value: `${user.streak } days`, icon: Zap, color: 'text-orange-600' }
  ];

  return (
    <div className="space-y-6">
      { /* SubHeader with welcome info */ }
      <SubHeader 
        showStreak={ true }
        showProgress={ true }
        user={ user }
      />

      { /* Hero Section */ }
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-yellow-300" />
            <span className="text-yellow-300 font-medium">Welcome to GyanaRatna</span>
          </div>
          <h1 className="text-4xl mb-4">Continue Your Learning Journey, { user.name }!</h1>
          <p className="text-blue-100 mb-6 max-w-2xl">
            Discover new knowledge, complete challenges, and unlock achievements. 
            Your next adventure in learning awaits!
          </p>
          <div className="flex flex-wrap gap-3">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={ () => onNavigate('courses') }
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Continue Learning
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600"
              onClick={ () => onNavigate('quiz') }
            >
              <Target className="w-5 h-5 mr-2" />
              Quick Quiz
            </Button>
          </div>
        </div>
        
        { /* Background decoration */ }
        <div className="absolute right-8 top-8 opacity-20">
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-blue-600" />
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <div className="w-48 h-48 bg-white rounded-full"></div>
        </div>
      </div>

      { /* Today's Challenge */ }
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3>Today's Challenge</h3>
                <p className="text-sm text-muted-foreground font-normal">{ todaysChallenge.description }</p>
              </div>
            </div>
            <Badge className="bg-orange-100 text-orange-800">+{ todaysChallenge.reward } XP</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{ todaysChallenge.icon }</span>
              <div>
                <p className="font-medium">{ todaysChallenge.title }</p>
                <p className="text-sm text-muted-foreground">
                  { todaysChallenge.progress }/{ todaysChallenge.target } completed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-orange-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                  style={ { width: `${(todaysChallenge.progress / todaysChallenge.target) * 100 }%` }}
                />
              </div>
              <Button onClick={ () => onNavigate('courses') }>
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      { /* Study Stats */ }
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        { studyStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index } className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className={ `w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3` }>
                  <IconComponent className={ `w-6 h-6 ${stat.color }`} />
                </div>
                <p className="text-2xl font-semibold mb-1">{ stat.value }</p>
                <p className="text-sm text-muted-foreground">{ stat.label }</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        { /* Featured Courses */ }
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Featured Courses
              </div>
              <Button variant="ghost" size="sm" onClick={ () => onNavigate('courses') }>
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            { featuredCourses.map((course) => (
              <div key={course.id } className="group cursor-pointer" onClick={ () => onNavigate('courses') }>
                <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted transition-colors">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                    <ImageWithFallback 
                      src={ course.imageUrl }
                      alt={ course.title }
                      className="w-full h-full object-cover"
                    />
                    <div className={ `absolute inset-0 bg-gradient-to-br ${course.color } opacity-80`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium group-hover:text-primary transition-colors">{ course.title }</h4>
                    <p className="text-sm text-muted-foreground mb-2">{ course.description }</p>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={ `h-full bg-gradient-to-r ${course.color } transition-all duration-300`}
                          style={ { width: `${course.progress }%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{ course.progress }%</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        { /* Recent Activity */ }
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            { recentActivities.map((activity, index) => (
              <div key={index } className="flex items-center gap-4 p-3 rounded-lg bg-muted">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                  { activity.type === 'lesson' && <BookOpen className="w-5 h-5 text-blue-600" /> }
                  { activity.type === 'quiz' && <Target className="w-5 h-5 text-purple-600" /> }
                  { activity.type === 'achievement' && <Award className="w-5 h-5 text-yellow-600" /> }
                </div>
                <div className="flex-1">
                  <p className="font-medium">{ activity.title }</p>
                  <p className="text-sm text-muted-foreground">{ activity.course } • { activity.timeAgo }</p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  +{ activity.xp } XP
                </Badge>
              </div>
            ))}
            <Button variant="ghost" className="w-full" onClick={ () => onNavigate('dashboard') }>
              View All Activities
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      { /* Quick Actions */ }
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-3"
              onClick={ () => onNavigate('courses') }
            >
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span>Browse Courses</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-3"
              onClick={ () => onNavigate('quiz') }
            >
              <Target className="w-8 h-8 text-purple-600" />
              <span>Take Quiz</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-3"
              onClick={ () => onNavigate('leaderboard') }
            >
              <Users className="w-8 h-8 text-green-600" />
              <span>Leaderboard</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-3"
              onClick={ () => onNavigate('achievements') }
            >
              <Award className="w-8 h-8 text-yellow-600" />
              <span>Achievements</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}