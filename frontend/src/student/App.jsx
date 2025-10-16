import { useState, useEffect } from "react";
import { Home } from "./components/home";
import { Search } from "./components/search";
import { Dashboard } from "./components/dashboard";
import { CourseSelection } from "./components/course-selection";
import { LessonViewer } from "./components/lesson-viewer";
import { QuizComponent } from "./components/quiz-component";
import { LearningGames } from "./components/learning-games";
import { Leaderboard } from "./components/leaderboard";
import { Achievements } from "./components/achievements";
import { TeacherDashboard } from "./components/teacher-dashboard";
import { ClassManagement } from "./components/class-management";
import { TeacherAnalytics } from "./components/teacher-analytics";
import { MobileNavMore } from "./components/mobile-nav-more";
import { HamburgerMenu } from "./components/hamburger-menu";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { Badge } from "./components/ui/badge";
import { Progress } from "./components/ui/progress";
import { BookOpen, Trophy, Award, User, Home as HomeIcon, Gamepad2, Search as SearchIcon, BarChart3, Users, Zap } from "lucide-react";

export default function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [userRole, setUserRole] = useState('student');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [xpGained, setXpGained] = useState(0);
  
  // Mock user data - in a real app this would come from a backend
  const [studentUser, setStudentUser] = useState({
    name: "Sarah Johnson",
    level: 10,
    xp: 2150,
    xpToNextLevel: 2500,
    streak: 18,
    totalBadges: 6,
    avatar: "SJ",
    lastLoginDate: new Date().toDateString(),
    dailyGoalProgress: 2,
    dailyGoalTarget: 3
  });

  const teacherUser = { name: "Ms. Rodriguez", school: "Rural Community School", classes: 3, totalStudents: 83, avatar: "MR" };

  // Today's Challenge
  const todaysChallenge = { title: "Math Master", description: "Complete 3 math lessons", progress: studentUser.dailyGoalProgress, target: studentUser.dailyGoalTarget, reward: 100, icon: "🧮" };

  // Next level rewards
  const nextLevelRewards = [
    { type: "Badge", name: "Knowledge Seeker", icon: "🏆" },
    { type: "XP Boost", name: "2x XP for 1 hour", icon: "⚡" },
    { type: "Avatar", name: "Scholar Avatar", icon: "👨‍🎓" }
  ];

  // Online/Offline detection
  useEffect(() => { const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline); };
  }, []);

  // XP Animation effect
  // XP Animation effect
  const triggerXpGain = (amount) => { setXpGained(amount);
    
    // Update user XP
    setStudentUser(prev => ({
      ...prev, xp: prev.xp + amount }));

    // Reset animation after delay
    setTimeout(() => { setXpGained(0); }, 2000);
  };
  const navigateToSection = (section) => { setCurrentSection(section); };

  const handleCourseSelect = (courseId) => { setSelectedCourse(courseId);
    setCurrentSection('lesson'); };

  const handleLessonComplete = () => { // Trigger XP gain animation
    triggerXpGain(50);
    setCurrentSection('dashboard'); };

  const handleQuizComplete = (score) => { // Calculate XP based on score
    const xpEarned = Math.round(score * 2); // 2 XP per percentage point
    triggerXpGain(xpEarned);
    console.log('Quiz completed with score:', score);
    setCurrentSection('dashboard'); };

  const studentNavigationItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'search', label: 'Search', icon: SearchIcon },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Users },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const teacherNavigationItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'search', label: 'Search', icon: SearchIcon },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'classes', label: 'My Classes', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: Award },
    { id: 'create-assignment', label: 'Assignments', icon: BookOpen },
    { id: 'messages', label: 'Messages', icon: Award },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const navigationItems = userRole === 'student' ? studentNavigationItems : teacherNavigationItems;
  
  // Items to keep in top header (search, dashboard, courses)
  const topHeaderItems = navigationItems.filter(item => 
    ['search', 'dashboard', 'courses'].includes(item.id)
  );
  
  // Items for hamburger menu (exclude top header items)
  const hamburgerMenuItems = navigationItems.filter(item => 
    !['search', 'dashboard', 'courses'].includes(item.id)
  );

  const renderContent = () => { if (userRole === 'student') {
      switch (currentSection) {
        case 'home':
          return <Home user={studentUser } onNavigate={ navigateToSection } />;
        case 'search':
          return <Search onNavigate={ navigateToSection } onBack={ () => setCurrentSection('home') } />;
        case 'dashboard':
          return <Dashboard user={ studentUser } onNavigate={ navigateToSection } />;
        case 'courses':
          return (
            <CourseSelection 
              onSelectCourse={ handleCourseSelect }
              onBack={ () => setCurrentSection('home') }
            />
          );
        case 'lesson':
          return (
            <LessonViewer 
              courseId={ selectedCourse }
              lessons={ [] }
              onComplete={ handleLessonComplete }
              onBack={ () => setCurrentSection('courses') }
            />
          );
        case 'games':
          return <LearningGames onBack={ () => setCurrentSection('home') } onNavigate={ navigateToSection } />;
        case 'leaderboard':
          return <Leaderboard onBack={ () => setCurrentSection('home') } />;
        case 'achievements':
          return <Achievements onBack={ () => setCurrentSection('home') } />;
        case 'profile':
          return (
            <div className="text-center py-20">
              <h2 className="text-2xl mb-4">Profile</h2>
              <p className="text-muted-foreground">Profile management coming soon!</p>
              <Button className="mt-4" onClick={ () => setCurrentSection('home') }>
                Back to Home
              </Button>
            </div>
          );
        default:
          return <Home user={ studentUser } onNavigate={ navigateToSection } />;
      }
    } else { switch (currentSection) {
        case 'home':
          return <TeacherDashboard teacher={teacherUser } onNavigate={ navigateToSection } />;
        case 'search':
          return <Search onNavigate={ navigateToSection } onBack={ () => setCurrentSection('home') } />;
        case 'dashboard':
          return <TeacherDashboard teacher={ teacherUser } onNavigate={ navigateToSection } />;
        case 'classes':
          return <ClassManagement onBack={ () => setCurrentSection('home') } />;
        case 'analytics':
          return <TeacherAnalytics onBack={ () => setCurrentSection('home') } />;
        case 'create-assignment':
          return (
            <div className="text-center py-20">
              <h2 className="text-2xl mb-4">Assignment Creation</h2>
              <p className="text-muted-foreground">Assignment creation feature coming soon!</p>
              <Button className="mt-4" onClick={ () => setCurrentSection('home') }>
                Back to Home
              </Button>
            </div>
          );
        case 'messages':
          return (
            <div className="text-center py-20">
              <h2 className="text-2xl mb-4">Messages</h2>
              <p className="text-muted-foreground">Messaging feature coming soon!</p>
              <Button className="mt-4" onClick={ () => setCurrentSection('home') }>
                Back to Home
              </Button>
            </div>
          );
        case 'profile':
          return (
            <div className="text-center py-20">
              <h2 className="text-2xl mb-4">Profile</h2>
              <p className="text-muted-foreground">Profile management coming soon!</p>
              <Button className="mt-4" onClick={ () => setCurrentSection('home') }>
                Back to Home
              </Button>
            </div>
          );
        default:
          return <TeacherDashboard teacher={ teacherUser } onNavigate={ navigateToSection } />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      { /* Compact Top Header */ }
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          { /* Left Side - Logo */ }
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg text-gray-900">GyanaRatna</h1>
              <p className="text-xs text-gray-500">Learn • Play • Grow</p>
            </div>
            <h1 className="sm:hidden text-lg text-gray-900">GyanaRatna</h1>
          </div>

          { /* Right Section - Navigation + User */ }
          <div className="flex items-center gap-2">
            { /* Essential Navigation (Search, Dashboard, Courses) */ }
            <div className="hidden md:flex items-center gap-1">
              { topHeaderItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.id }
                    variant={ currentSection === item.id ? "default" : "ghost" }
                    size="sm"
                    onClick={ () => navigateToSection(item.id) }
                    className="flex items-center gap-2"
                  >
                    <IconComponent className="w-4 h-4" />
                    { item.label }
                  </Button>
                );
              })}
            </div>

            { /* User Profile */ }
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  { userRole === 'student' ? studentUser.avatar : teacherUser.avatar }
                </AvatarFallback>
              </Avatar>
              
              { /* Hamburger Menu */ }
              <HamburgerMenu
                userRole={ userRole }
                currentSection={ currentSection }
                studentUser={ studentUser }
                teacherUser={ teacherUser }
                menuItems={ hamburgerMenuItems }
                onNavigate={ navigateToSection }
                onRoleSwitch={ (role) => {
                  setUserRole(role);
                  setCurrentSection('home'); }}
              />
            </div>
          </div>
        </div>
      </header>

      { /* Main Content */ }
      <main className="max-w-7xl mx-auto px-4 py-6">
        { renderContent() }
      </main>

      { /* Mobile Bottom Navigation - Only Essential Items */ }
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
        <div className="flex items-center justify-around">
          { /* Show essential navigation items: home + top header items */ }
          { [
            navigationItems.find(item => item.id === 'home'), ...topHeaderItems
          ].filter(Boolean).map((item) => {
            if (!item) return null;
            const IconComponent = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id }
                onClick={ () => navigateToSection(item.id) }
                className={ `flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs font-medium">{ item.label }</span>
              </button>
            );
          })}
        </div>
      </nav>

      { /* Offline Status Indicator */ }
      <div className="fixed bottom-24 md:bottom-4 right-4 z-40">
        <Card className={ `${isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200' }`}>
          <CardContent className="p-2">
            <div className={ `flex items-center gap-2 ${isOnline ? 'text-green-800' : 'text-red-800' }`}>
              { isOnline ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs">Online</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs">Offline</span>
                </>
              ) }
            </div>
          </CardContent>
        </Card>
      </div>

      { /* Demo XP Button - For Testing Animation */ }
      { userRole === 'student' && (
        <div className="fixed bottom-24 md:bottom-20 right-4 z-40">
          <Button 
            size="sm" 
            variant="outline"
            className="bg-white shadow-lg text-xs"
            onClick={() => triggerXpGain(25) }
          >
            <Zap className="w-3 h-3 mr-1" />
            +25 XP
          </Button>
        </div>
      )}
    </div>
  );
}