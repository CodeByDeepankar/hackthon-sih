import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, TrendingUp, Users, BookOpen, Award, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

// STEM-focused data for charts
const overviewData = [
  { month: 'Jan', students: 220, completion: 68, avgScore: 74 },
  { month: 'Feb', students: 225, completion: 71, avgScore: 76 },
  { month: 'Mar', students: 228, completion: 75, avgScore: 78 },
  { month: 'Apr', students: 232, completion: 78, avgScore: 80 },
  { month: 'May', students: 235, completion: 81, avgScore: 82 },
  { month: 'Jun', students: 238, completion: 84, avgScore: 84 }
];

const performanceData = [
  { subject: 'Mathematics', excellent: 52, good: 98, needsImprovement: 28 },
  { subject: 'Science', excellent: 48, good: 105, needsImprovement: 25 },
  { subject: 'Technology', excellent: 35, good: 89, needsImprovement: 22 },
  { subject: 'Engineering', excellent: 28, good: 67, needsImprovement: 19 }
];

const engagementData = [
  { day: 'Mon', active: 198, logins: 220, submissions: 165 },
  { day: 'Tue', active: 215, logins: 238, submissions: 189 },
  { day: 'Wed', active: 205, logins: 228, submissions: 172 },
  { day: 'Thu', active: 225, logins: 248, submissions: 201 },
  { day: 'Fri', active: 235, logins: 255, submissions: 218 },
  { day: 'Sat', active: 98, logins: 115, submissions: 78 },
  { day: 'Sun', active: 85, logins: 102, submissions: 65 }
];

const progressDistribution = [
  { name: 'Excellent (80-100%)', value: 52, color: '#10b981' },
  { name: 'Good (60-79%)', value: 145, color: '#3b82f6' },
  { name: 'Fair (40-59%)', value: 32, color: '#f59e0b' },
  { name: 'Needs Help (<40%)', value: 9, color: '#ef4444' }
];

const topPerformers = [
  { name: 'Maya Patel', class: 'Grade 10A', score: 93, subjects: ['Math', 'Science', 'Engineering'] },
  { name: 'Emily Chen', class: 'Grade 7A', score: 91, subjects: ['Science', 'Engineering', 'Technology'] },
  { name: 'Alex Thompson', class: 'Grade 9A', score: 87, subjects: ['Engineering', 'Technology'] },
  { name: 'Sarah Mitchell', class: 'Grade 6A', score: 85, subjects: ['Math', 'Science'] },
  { name: 'James Kumar', class: 'Grade 6A', score: 72, subjects: ['Technology', 'Math'] }
];

const strugglingStudents = [
  { name: 'David Rodriguez', class: 'Grade 8A', score: 58, concerns: ['Math fundamentals', 'STEM engagement'] },
  { name: 'Jordan Smith', class: 'Grade 7A', score: 54, concerns: ['Science concepts', 'Problem solving'] },
  { name: 'Casey Williams', class: 'Grade 9A', score: 61, concerns: ['Engineering design', 'Math application'] },
  { name: 'Taylor Brown', class: 'Grade 8A', score: 57, concerns: ['Technology skills', 'Project completion'] }
];

const timeFrameOptions = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' }
];
