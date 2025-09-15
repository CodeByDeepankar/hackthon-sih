import React, { useState, useMemo } from 'react';
import { Search, Filter, User, TrendingUp, TrendingDown, Minus, BookOpen, Award, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';

// STEM-focused student data
const studentsData = [
  { id: 1, name: "Sarah Mitchell", class: "Grade 6A - Mathematics", grade: 6, overallProgress: 85, subjects: {
      Mathematics: { progress: 85, trend: "up", recentActivity: "Algebra Problem Sets", lastActive: "2 hours ago" },
      Science: { progress: 78, trend: "up", recentActivity: "Lab: Chemical Reactions", lastActive: "1 day ago" },
      Technology: { progress: 82, trend: "stable", recentActivity: "Programming Basics", lastActive: "3 hours ago" },
      Engineering: { progress: 79, trend: "up", recentActivity: "Bridge Design Project", lastActive: "5 hours ago" }
    },
    achievements: ["STEM Excellence", "Math Champion", "Science Fair Winner"],
    totalLessons: 45,
    completedLessons: 38,
    averageScore: 81
  },
  { id: 2, name: "James Kumar", class: "Grade 6A - Mathematics", grade: 6, overallProgress: 72, subjects: {
      Mathematics: { progress: 72, trend: "up", recentActivity: "Geometry Fundamentals", lastActive: "4 hours ago" },
      Science: { progress: 68, trend: "stable", recentActivity: "Physics Concepts", lastActive: "2 days ago" },
      Technology: { progress: 75, trend: "up", recentActivity: "Digital Design", lastActive: "1 day ago" },
      Engineering: { progress: 73, trend: "stable", recentActivity: "Simple Machines", lastActive: "6 hours ago" }
    },
    achievements: ["Team Player", "Tech Innovator"],
    totalLessons: 45,
    completedLessons: 32,
    averageScore: 72
  },
  { id: 3, name: "Emily Chen", class: "Grade 7A - Science", grade: 7, overallProgress: 91, subjects: {
      Mathematics: { progress: 88, trend: "stable", recentActivity: "Advanced Algebra", lastActive: "1 hour ago" },
      Science: { progress: 95, trend: "up", recentActivity: "Advanced Chemistry Lab", lastActive: "3 hours ago" },
      Technology: { progress: 89, trend: "up", recentActivity: "Web Development", lastActive: "2 hours ago" },
      Engineering: { progress: 92, trend: "up", recentActivity: "Robotics Project", lastActive: "4 hours ago" }
    },
    achievements: ["Outstanding STEM Student", "Science Excellence", "Innovation Award", "Tech Leader"],
    totalLessons: 42,
    completedLessons: 40,
    averageScore: 91
  },
  { id: 4, name: "David Rodriguez", class: "Grade 8A - Technology", grade: 8, overallProgress: 58, subjects: {
      Mathematics: { progress: 52, trend: "down", recentActivity: "Pre-Algebra Review", lastActive: "1 week ago" },
      Science: { progress: 58, trend: "stable", recentActivity: "Basic Biology", lastActive: "3 days ago" },
      Technology: { progress: 65, trend: "up", recentActivity: "Computer Basics", lastActive: "2 days ago" },
      Engineering: { progress: 55, trend: "stable", recentActivity: "Design Thinking", lastActive: "4 days ago" }
    },
    achievements: ["Effort in Technology"],
    totalLessons: 38,
    completedLessons: 22,
    averageScore: 58
  },
  { id: 5, name: "Alex Thompson", class: "Grade 9A - Engineering", grade: 9, overallProgress: 87, subjects: {
      Mathematics: { progress: 84, trend: "stable", recentActivity: "Trigonometry", lastActive: "6 hours ago" },
      Science: { progress: 89, trend: "up", recentActivity: "Physics Lab", lastActive: "4 hours ago" },
      Technology: { progress: 88, trend: "up", recentActivity: "CAD Design", lastActive: "1 day ago" },
      Engineering: { progress: 87, trend: "stable", recentActivity: "Mechanical Systems", lastActive: "2 hours ago" }
    },
    achievements: ["Engineering Excellence", "Innovation Leader", "Design Thinking Award"],
    totalLessons: 40,
    completedLessons: 37,
    averageScore: 87
  },
  { id: 6, name: "Maya Patel", class: "Grade 10A - Advanced Mathematics", grade: 10, overallProgress: 93, subjects: {
      Mathematics: { progress: 96, trend: "up", recentActivity: "Calculus Introduction", lastActive: "1 hour ago" },
      Science: { progress: 91, trend: "stable", recentActivity: "Advanced Physics", lastActive: "3 hours ago" },
      Technology: { progress: 90, trend: "up", recentActivity: "AI Fundamentals", lastActive: "2 hours ago" },
      Engineering: { progress: 95, trend: "up", recentActivity: "Advanced Robotics", lastActive: "4 hours ago" }
    },
    achievements: ["STEM Valedictorian", "Math Olympiad", "Science Fair Champion", "Tech Innovation"],
    totalLessons: 48,
    completedLessons: 46,
    averageScore: 93
  }
];

const classOptions = [
  "All Classes",
  "Grade 6A - Mathematics",
  "Grade 6A - Science",
  "Grade 7A - Mathematics", 
  "Grade 7A - Science",
  "Grade 8A - Technology",
  "Grade 9A - Engineering",
  "Grade 10A - Advanced Mathematics",
  "Grade 11A - Advanced Science",
  "Grade 12A - Advanced Engineering"
];
