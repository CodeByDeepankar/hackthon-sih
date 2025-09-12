import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Menu, BookOpen, Map, Gamepad2, Heart, Swords, Users, Award, UserCheck, GraduationCap, Star, Settings, LogOut } from "lucide-react";

export function HamburgerMenu({ userRole, currentSection, studentUser, teacherUser, menuItems, onNavigate, onRoleSwitch }) { const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { signOut } = useClerk();

  const handleNavigate = (section) => {
    onNavigate(section);
    setIsOpen(false); };

  const currentUser = userRole === 'student' ? studentUser : teacherUser;

  return (
  <Sheet open={ isOpen } onOpenChange={ setIsOpen }>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-80 p-0 !bg-white !text-gray-900 border-r border-gray-200"
      >
        <div className="flex flex-col h-full">
          { /* User Profile Section */ }
          <SheetHeader className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 border-white/20">
                <AvatarFallback className="bg-white/10 text-white">
                  { currentUser.avatar }
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <SheetTitle className="text-white text-left">
                  { currentUser.name }
                </SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  { userRole === 'student' ? (
                    <>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                        Student
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                        Teacher
                      </Badge>
                      <span className="text-sm">{teacherUser.school }</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </SheetHeader>

          { /* Navigation Items */ }
          <div className="flex-1 p-4">
            <div className="space-y-2">
              { menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <Button
                    key={item.id }
                    variant={ isActive ? "default" : "ghost" }
                    className="w-full justify-start gap-3 h-12"
                    onClick={ () => handleNavigate(item.id) }
                  >
                    <IconComponent className="w-5 h-5" />
                    { item.label }
                  </Button>
                );
              })}
            </div>

          </div>

          { /* Footer Actions */ }
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={() => {
                  setIsOpen(false);
                  router.push("/settings");
                }}
              >
                <Settings className="w-5 h-5" />
                Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  setIsOpen(false);
                  // Redirect to home after sign out
                  signOut({ redirectUrl: "/" });
                }}
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}