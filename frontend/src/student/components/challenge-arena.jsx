import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { SubHeader } from "./sub-header";
import { Sword, Shield, Trophy, Users, Zap, Clock, Star, Crown, Target, Flame, Gem, Play, Eye, User, Timer, Award, ChevronRight, Swords, BookOpen, Calculator, Globe, Atom } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export default function ChallengeArena() {
	const challenges = [
		{ id: 1, title: 'Daily Math Duel', progress: 66, emoji: '🧮' },
		{ id: 2, title: 'Science Sprint', progress: 35, emoji: '🔬' },
	];
	return (
		<div className="space-y-4">
			<SubHeader showChallenge todaysChallenge={{ title: 'Math Master', icon: '🧮', progress: 2, target: 3, reward: 100 }} />
			<div className="grid gap-4 md:grid-cols-2">
				{challenges.map(ch => (
					<Card key={ch.id}>
						<CardHeader>
							<CardTitle className="flex items-center gap-2"><span className="text-lg">{ch.emoji}</span>{ch.title}</CardTitle>
						</CardHeader>
						<CardContent>
							<Progress value={ch.progress} className="h-2" />
							<div className="flex items-center justify-between mt-3 text-sm">
								<span className="text-gray-500 dark:text-slate-300">{ch.progress}%</span>
								<Button size="sm" className="light:text-black">Continue</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
