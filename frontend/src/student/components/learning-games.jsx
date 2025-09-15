import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { SubHeader } from "./sub-header";
import { Gamepad2, Brain, Zap, Puzzle, Timer, Users, Star, Trophy, Play, RotateCcw, Target, Sparkles, BookOpen, Calculator, Globe, Atom, ChevronRight, Crown, Gem } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useI18n } from "@/i18n/useI18n";

export default function LearningGames() {
	const { t } = useI18n();
	const games = [
		{ id: 'math-blitz', title: t.games.titles.mathBlitz(), emoji: '🔢', status: t.games.status.new() },
		{ id: 'science-quest', title: t.games.titles.scienceQuest(), emoji: '🧪', status: t.games.status.popular() },
	];
	return (
			<div className="space-y-4">
				<SubHeader customContent={<div className="text-sm light:text-black text-gray-600">{t.games.intro()}</div>} />
			<div className="grid gap-4 md:grid-cols-2">
				{games.map(g => (
					<Card key={g.id}>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span className="flex items-center gap-2"><span className="text-lg">{g.emoji}</span>{g.title}</span>
								<Badge variant="secondary">{g.status}</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Button size="sm" className="gap-2 light:text-black"><Play className="w-4 h-4" /> {t.common.play()}</Button>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
