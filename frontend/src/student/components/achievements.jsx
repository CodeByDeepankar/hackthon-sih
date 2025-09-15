import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Award, Star, Trophy, Target, BookOpen, Zap, Calendar, Users, ChevronLeft, Lock, CheckCircle } from "lucide-react";

// Add this import at the top of the file
import { useState } from "react";
import { useI18n } from "@/i18n/useI18n";

export default function Achievements() {
	const { t } = useI18n();
	const achievements = [
		{ id: 1, title: 'Math Whiz', desc: 'Complete 10 math lessons', icon: <Award className="w-4 h-4" /> },
		{ id: 2, title: 'Science Explorer', desc: 'Finish 5 experiments', icon: <Star className="w-4 h-4" /> },
	];
	return (
		<div className="space-y-4">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{achievements.map(a => (
					<Card key={a.id}>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">{a.icon}<span>{a.title}</span></CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-gray-600">{a.desc}</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}