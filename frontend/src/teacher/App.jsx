import React, { useState } from 'react';
import { Menu, Home, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { Button } from './components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { ClassOverview } from './components/ClassOverview';
import { StudentProgress } from './components/StudentProgress';
import { ProgressReports } from './components/ProgressReports';

export default function App() { const [currentView, setCurrentView] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'home' as ViewType, label: 'Dashboard', description: 'Overview of all STEM education metrics', icon: Home },
    { id: 'class-overview' as ViewType, label: 'Classes', description: 'STEM classes and student statistics', icon: Users },
    { id: 'student-progress' as ViewType, label: 'Students', description: 'Individual STEM performance tracking', icon: TrendingUp },
    { id: 'progress-reports' as ViewType, label: 'Reports', description: 'STEM analytics and detailed reports', icon: BarChart3 }
  ];

  const handleNavigation = (view: ViewType) => { setCurrentView(view);
    setIsMenuOpen(false); };

  const getCurrentViewTitle = () => { const item = navigationItems.find(item => item.id === currentView);
    return item?.label || 'Dashboard'; };

  const renderHomeView = () => (
    <div className="space-y-8">
      { /* Welcome Section */ }
      <div className="mb-8">
        <div className="bg-white rounded-2xl p-8 card-shadow-lg">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, Teacher!
          </h1>
          <p className="text-gray-600 text-lg">
            Ready to continue monitoring your STEM students' learning journey?
          </p>
        </div>
      </div>

      { /* Quick Navigation Cards */ }
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        { navigationItems.slice(1).map((item) => {
          const IconComponent = item.icon;
          return (
            <Card 
              key={item.id } 
              className="cursor-pointer hover:card-shadow-lg transition-all duration-300 hover:scale-105 card-shadow border-0"
              onClick={ () => handleNavigation(item.id) }
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-gray-800">{ item.label }</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-center text-sm">{ item.description }</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      { /* Dashboard Sections */ }
      <div className="space-y-12">
        { /* Class Overview Section */ }
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">STEM Classes Overview</h2>
            <Button 
              variant="outline" 
              onClick={ () => handleNavigation('class-overview') }
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              View Full Overview
            </Button>
          </div>
          <div className="bg-white rounded-2xl p-6 card-shadow-lg">
            <ClassOverview compact={ true } />
          </div>
        </div>

        { /* Student Progress Section */ }
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Student Progress Tracking</h2>
            <Button 
              variant="outline" 
              onClick={ () => handleNavigation('student-progress') }
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              View All Students
            </Button>
          </div>
          <div className="bg-white rounded-2xl p-6 card-shadow-lg">
            <StudentProgress compact={ true } />
          </div>
        </div>

        { /* Progress Reports Section */ }
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">STEM Analytics & Reports</h2>
            <Button 
              variant="outline" 
              onClick={ () => handleNavigation('progress-reports') }
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              View Full Reports
            </Button>
          </div>
          <div className="bg-white rounded-2xl p-6 card-shadow-lg">
            <ProgressReports compact={ true } />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentView = () => { const content = (() => {
      switch (currentView) {
        case 'home':
          return renderHomeView();
        case 'class-overview':
          return <ClassOverview />;
        case 'student-progress':
          return <StudentProgress />;
        case 'progress-reports':
          return <ProgressReports />;
        default:
          return renderHomeView(); }
    })();

    // Wrap non-home views in white containers
    if (currentView !== 'home') { return (
        <div className="bg-white rounded-2xl p-6 card-shadow-lg">
          {content }
        </div>
      );
    }

    return content;
  };

  return (
    <div className="min-h-screen flex">
      { /* Sidebar */ }
      <div className="w-64 bg-sidebar text-sidebar-foreground p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">STEM Dashboard</h1>
            <p className="text-sm text-sidebar-foreground/70">Grades 6-12</p>
          </div>
        </div>
        
        <nav className="space-y-2 flex-1">
          { navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id }
                onClick={ () => handleNavigation(item.id) }
                className={ `w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                  currentView === item.id
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                    : 'hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-sidebar-foreground' }`}
              >
                <IconComponent className="h-5 w-5" />
                <span className="font-medium">{ item.label }</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60">
            © 2024 STEM Education System
          </div>
        </div>
      </div>

      { /* Mobile Menu */ }
      <Sheet open={ isMenuOpen } onOpenChange={ setIsMenuOpen }>
        <SheetContent side="left" className="w-64 bg-sidebar text-sidebar-foreground p-0">
          <div className="p-6">
            <SheetHeader className="mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <SheetTitle className="text-sidebar-foreground">STEM Dashboard</SheetTitle>
              </div>
            </SheetHeader>
            <nav className="space-y-2">
              { navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id }
                    onClick={ () => handleNavigation(item.id) }
                    className={ `w-full text-left p-3 rounded-xl transition-colors flex items-center gap-3 ${
                      currentView === item.id
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'hover:bg-sidebar-accent' }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="font-medium">{ item.label }</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      { /* Main Content Area */ }
      <div className="flex-1 gradient-bg">
        { /* Mobile Header */ }
        <header className="md:hidden bg-white/10 backdrop-blur-sm border-b border-white/20 p-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <Sheet open={ isMenuOpen } onOpenChange={ setIsMenuOpen }>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <h1 className="text-xl font-semibold text-white">{ getCurrentViewTitle() }</h1>
            <div className="w-10"></div>
          </div>
        </header>

        { /* Main Content */ }
        <main className="p-6 max-w-7xl mx-auto">
          <div className="md:mb-6 hidden md:block">
            <h1 className="text-3xl font-bold text-white mb-2">{ getCurrentViewTitle() }</h1>
          </div>
          { renderCurrentView() }
        </main>
      </div>
    </div>
  );
}