import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { SubHeader } from "./sub-header";
import { BookOpen, Award, TrendingUp, Calendar, Star, Flame, Users, Target } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Dashboard({ user, onNavigate }) { const progressPercentage = (user.xp / user.xpToNextLevel) * 100;

  // Today's Challenge
  const todaysChallenge = {
    title: "Math Master", description: "Complete 3 math lessons", progress: user.dailyGoalProgress || 2, target: user.dailyGoalTarget || 3, reward: 100, icon: "🧮" };

  // Next level rewards
  const nextLevelRewards = [
    { type: "Badge", name: "Knowledge Seeker", icon: "🏆" },
    { type: "XP Boost", name: "2x XP for 1 hour", icon: "⚡" },
    { type: "Avatar", name: "Scholar Avatar", icon: "👨‍🎓" }
  ];

  const recentAchievements = [
    { name: "Math Whiz", description: "Complete 10 math lessons", icon: "🧮" },
    { name: "Science Explorer", description: "Discover 5 experiments", icon: "🔬" },
    { name: "Reading Champion", description: "Read 20 stories", icon: "📚" }
  ];

  const dailyGoals = [
    { task: "Complete 1 lesson", completed: true },
    { task: "Answer 10 quiz questions", completed: true },
    { task: "Read for 30 minutes", completed: false }
  ];

  return (
    <div className="space-y-6">
      { /* SubHeader with Dashboard-specific info */ }
      <SubHeader 
        showStreak={ true }
        showChallenge={ true }
        showRewards={ true }
        user={ user }
        todaysChallenge={ todaysChallenge }
        nextLevelRewards={ nextLevelRewards }
      />

      { /* Welcome Header */ }
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="relative z-10">
          <h1 className="text-2xl mb-2">Welcome back, { user.name }!</h1>
          <p className="opacity-90">Ready to continue your learning journey?</p>
        </div>
        <div className="absolute right-4 top-4 opacity-20">
          <BookOpen size={ 64 } />
        </div>
      </div>

      { /* Stats Grid */ }
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">Level</p>
            <p className="text-xl">{ user.level }</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2">
              <Flame className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-sm text-muted-foreground">Streak</p>
            <p className="text-xl">{ user.streak } days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Badges</p>
            <p className="text-xl">{ user.totalBadges }</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-muted-foreground">XP</p>
            <p className="text-xl">{ user.xp }</p>
          </CardContent>
        </Card>
      </div>

      { /* Progress Section */ }
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Progress to Level { user.level + 1 }
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{ user.xp } XP</span>
              <span>{ user.xpToNextLevel } XP</span>
            </div>
            <Progress value={ progressPercentage } className="h-3" />
            <p className="text-sm text-muted-foreground">
              { user.xpToNextLevel - user.xp } XP needed for next level
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        { /* Recent Achievements */ }
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              { recentAchievements.map((achievement, index) => (
                <div key={index } className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <span className="text-2xl">{ achievement.icon }</span>
                  <div className="flex-1">
                    <p className="font-medium">{ achievement.name }</p>
                    <p className="text-sm text-muted-foreground">{ achievement.description }</p>
                  </div>
                  <Badge variant="secondary">New</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        { /* Daily Goals */ }
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              { dailyGoals.map((goal, index) => (
                <div key={index } className="flex items-center gap-3">
                  <div className={ `w-4 h-4 rounded-full border-2 ${
                    goal.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300' }`}>
                    { goal.completed && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    ) }
                  </div>
                  <span className={ goal.completed ? 'line-through text-muted-foreground' : '' }>
                    { goal.task }
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      { /* Quick Actions */ }
      <Card>
        <CardHeader>
          <CardTitle>Continue Learning</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              onClick={ () => onNavigate('courses') } 
              className="h-auto p-4 flex flex-col items-center gap-2"
              variant="outline"
            >
              <BookOpen className="w-8 h-8" />
              <span>Start Lesson</span>
            </Button>
            <Button 
              onClick={ () => onNavigate('quiz') } 
              className="h-auto p-4 flex flex-col items-center gap-2"
              variant="outline"
            >
              <Target className="w-8 h-8" />
              <span>Take Quiz</span>
            </Button>
            <Button 
              onClick={ () => onNavigate('leaderboard') } 
              className="h-auto p-4 flex flex-col items-center gap-2"
              variant="outline"
            >
              <Users className="w-8 h-8" />
              <span>View Leaderboard</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}