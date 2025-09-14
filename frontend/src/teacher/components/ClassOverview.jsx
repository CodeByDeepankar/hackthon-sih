import React, { useState, useMemo } from 'react';
import { Users, TrendingUp, BookOpen, AlertTriangle, Search, Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

// STEM subjects data
const stemSubjects = ['Mathematics', 'Science', 'Technology', 'Engineering'];

// Grades 6-12 classes with comprehensive STEM subjects
const classesData = [
  { id: 1, grade: 6, section: 'A', name: 'Grade 6A', students: 28, activeStudents: 26, subjects: {
      Mathematics: {
        averageProgress: 78, completedLessons: 15, totalLessons: 20, topPerformers: ['Sarah M.', 'James K.', 'Maria L.'], needsAttention: ['David R.', 'Lisa P.'] },
      Science: { averageProgress: 82, completedLessons: 18, totalLessons: 22, topPerformers: ['Emily R.', 'Noah D.', 'Sophia T.'], needsAttention: ['Lucas M.'] },
      Technology: { averageProgress: 75, completedLessons: 12, totalLessons: 16, topPerformers: ['Alex C.', 'Maya S.', 'Ryan W.'], needsAttention: ['Jordan P.', 'Casey T.'] },
      Engineering: { averageProgress: 71, completedLessons: 8, totalLessons: 12, topPerformers: ['Taylor B.', 'Casey R.', 'Morgan L.'], needsAttention: ['Jamie K.', 'River T.'] }
    }
  },
  { id: 2, grade: 7, section: 'A', name: 'Grade 7A', students: 30, activeStudents: 28, subjects: {
      Mathematics: {
        averageProgress: 75, completedLessons: 14, totalLessons: 18, topPerformers: ['Oliver P.', 'Emma K.', 'Liam J.'], needsAttention: ['Ava W.', 'Mason T.'] },
      Science: { averageProgress: 80, completedLessons: 16, totalLessons: 20, topPerformers: ['Harper L.', 'Sebastian M.', 'Evelyn P.'], needsAttention: ['Logan R.'] },
      Technology: { averageProgress: 77, completedLessons: 13, totalLessons: 17, topPerformers: ['Phoenix J.', 'River C.', 'Skylar N.'], needsAttention: ['Cameron W.', 'Jordan L.'] },
      Engineering: { averageProgress: 73, completedLessons: 10, totalLessons: 14, topPerformers: ['Kai M.', 'Sage L.', 'River P.'], needsAttention: ['Blake T.', 'Quinn S.'] }
    }
  },
  { id: 3, grade: 8, section: 'A', name: 'Grade 8A', students: 25, activeStudents: 24, subjects: {
      Mathematics: {
        averageProgress: 79, completedLessons: 16, totalLessons: 20, topPerformers: ['Maya P.', 'Alex T.', 'Jordan M.'], needsAttention: ['Sam R.', 'Casey L.'] },
      Science: { averageProgress: 83, completedLessons: 19, totalLessons: 23, topPerformers: ['Riley K.', 'Taylor D.', 'Morgan F.'], needsAttention: ['Avery B.'] },
      Technology: { averageProgress: 85, completedLessons: 12, totalLessons: 15, topPerformers: ['Alex C.', 'Maya S.', 'Ryan W.'], needsAttention: ['Jordan P.'] },
      Engineering: { averageProgress: 76, completedLessons: 11, totalLessons: 15, topPerformers: ['Dakota N.', 'River S.', 'Sage M.'], needsAttention: ['Phoenix L.', 'Quinn T.'] }
    }
  },
  { id: 4, grade: 9, section: 'A', name: 'Grade 9A', students: 22, activeStudents: 21, subjects: {
      Mathematics: {
        averageProgress: 81, completedLessons: 17, totalLessons: 21, topPerformers: ['Casey W.', 'Jordan B.', 'Riley M.'], needsAttention: ['Taylor L.'] },
      Science: { averageProgress: 78, completedLessons: 15, totalLessons: 19, topPerformers: ['Alex T.', 'Morgan K.', 'Sage P.'], needsAttention: ['Dakota R.', 'Phoenix S.'] },
      Technology: { averageProgress: 84, completedLessons: 14, totalLessons: 17, topPerformers: ['River D.', 'Quinn L.', 'Avery N.'], needsAttention: ['Kai T.'] },
      Engineering: { averageProgress: 77, completedLessons: 10, totalLessons: 14, topPerformers: ['Taylor B.', 'Casey R.', 'Morgan L.'], needsAttention: ['Jamie K.', 'River T.'] }
    }
  },
  { id: 5, grade: 10, section: 'A', name: 'Grade 10A', students: 26, activeStudents: 25, subjects: {
      Mathematics: {
        averageProgress: 73, completedLessons: 13, totalLessons: 18, topPerformers: ['Avery M.', 'Quinn D.', 'Sage F.'], needsAttention: ['Dakota L.', 'Rowan S.'] },
      Science: { averageProgress: 76, completedLessons: 14, totalLessons: 18, topPerformers: ['River C.', 'Phoenix J.', 'Kai L.'], needsAttention: ['Taylor M.', 'Casey N.'] },
      Technology: { averageProgress: 80, completedLessons: 15, totalLessons: 19, topPerformers: ['Jordan P.', 'Morgan S.', 'Alex R.'], needsAttention: ['Riley T.'] },
      Engineering: { averageProgress: 78, completedLessons: 12, totalLessons: 16, topPerformers: ['Sage W.', 'Dakota B.', 'Quinn M.'], needsAttention: ['Avery K.', 'River L.'] }
    }
  },
  { id: 6, grade: 11, section: 'A', name: 'Grade 11A', students: 24, activeStudents: 23, subjects: {
      Mathematics: {
        averageProgress: 82, completedLessons: 16, totalLessons: 20, topPerformers: ['Maya P.', 'Alex T.', 'Jordan K.'], needsAttention: ['Sam L.'] },
      Science: { averageProgress: 79, completedLessons: 15, totalLessons: 19, topPerformers: ['Phoenix J.', 'River C.', 'Skylar N.'], needsAttention: ['Cameron W.'] },
      Technology: { averageProgress: 85, completedLessons: 17, totalLessons: 20, topPerformers: ['Casey R.', 'Taylor M.', 'Morgan D.'], needsAttention: ['Riley S.'] },
      Engineering: { averageProgress: 81, completedLessons: 14, totalLessons: 17, topPerformers: ['Kai B.', 'Sage T.', 'Dakota F.'], needsAttention: ['Quinn L.', 'Avery P.'] }
    }
  },
  { id: 7, grade: 12, section: 'A', name: 'Grade 12A', students: 20, activeStudents: 19, subjects: {
      Mathematics: {
        averageProgress: 84, completedLessons: 17, totalLessons: 20, topPerformers: ['River M.', 'Phoenix K.', 'Sage D.'], needsAttention: ['Jordan T.'] },
      Science: { averageProgress: 86, completedLessons: 18, totalLessons: 21, topPerformers: ['Alex L.', 'Casey B.', 'Taylor R.'], needsAttention: ['Morgan S.'] },
      Technology: { averageProgress: 88, completedLessons: 16, totalLessons: 18, topPerformers: ['Quinn F.', 'Dakota N.', 'Kai W.'], needsAttention: [] },
      Engineering: { averageProgress: 81, completedLessons: 14, totalLessons: 16, topPerformers: ['Kai M.', 'Sage L.', 'River P.'], needsAttention: ['Blake T.'] }
    }
  }
];

// Comprehensive student data for STEM subjects
const studentsData = [
  { id: 1, name: 'Sarah Mitchell', grade: 6, subjects: {
      Mathematics: { 
        weekly: [85, 87, 89, 91], monthly: [85, 88, 92], quarterly: [85, 89], yearly: [87], currentProgress: 91, trend: 'up' },
      Science: { weekly: [78, 80, 82, 85], monthly: [78, 81, 85], quarterly: [78, 83], yearly: [81], currentProgress: 85, trend: 'up' },
      Technology: { weekly: [82, 84, 86, 88], monthly: [82, 85, 88], quarterly: [82, 87], yearly: [84], currentProgress: 88, trend: 'stable' },
      Engineering: { weekly: [75, 77, 79, 81], monthly: [75, 78, 81], quarterly: [75, 80], yearly: [77], currentProgress: 81, trend: 'up' }
    },
    overallProgress: 86
  },
  { id: 2, name: 'James Kumar', grade: 6, subjects: {
      Mathematics: { 
        weekly: [72, 74, 76, 78], monthly: [72, 75, 78], quarterly: [72, 77], yearly: [74], currentProgress: 78, trend: 'up' },
      Science: { weekly: [65, 67, 69, 71], monthly: [65, 68, 71], quarterly: [65, 70], yearly: [67], currentProgress: 71, trend: 'up' },
      Technology: { weekly: [70, 72, 74, 76], monthly: [70, 73, 76], quarterly: [70, 75], yearly: [72], currentProgress: 76, trend: 'stable' },
      Engineering: { weekly: [68, 70, 72, 74], monthly: [68, 71, 74], quarterly: [68, 73], yearly: [70], currentProgress: 74, trend: 'up' }
    },
    overallProgress: 75
  },
  // Add more students...
  { id: 3, name: 'Emily Chen', grade: 7, subjects: {
      Mathematics: { 
        weekly: [88, 90, 92, 94], monthly: [88, 91, 94], quarterly: [88, 93], yearly: [90], currentProgress: 94, trend: 'up' },
      Science: { weekly: [95, 96, 97, 98], monthly: [95, 96, 98], quarterly: [95, 97], yearly: [96], currentProgress: 98, trend: 'up' },
      Technology: { weekly: [86, 87, 88, 89], monthly: [86, 87, 89], quarterly: [86, 88], yearly: [87], currentProgress: 89, trend: 'stable' },
      Engineering: { weekly: [83, 84, 85, 86], monthly: [83, 84, 86], quarterly: [83, 85], yearly: [84], currentProgress: 86, trend: 'up' }
    },
    overallProgress: 92
  }
];
