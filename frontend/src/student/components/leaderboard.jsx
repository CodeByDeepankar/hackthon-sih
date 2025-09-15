import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Trophy, Medal, Award, Star, TrendingUp, ChevronLeft, Crown, Users, Calendar, Target } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";

export default function Leaderboard() {
	const { t } = useI18n();
	const leaders = [
		{ name: 'Sarah', xp: 2150, avatar: 'S' },
		{ name: 'Arjun', xp: 2080, avatar: 'A' },
		{ name: 'Maya', xp: 1900, avatar: 'M' },
	];
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5" /> {t.leaderboard.title()}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{leaders.map((l, i) => (
					<div key={l.name} className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Avatar className="w-8 h-8"><AvatarFallback>{l.avatar}</AvatarFallback></Avatar>
							<span className="font-medium">{i + 1}. {l.name}</span>
						</div>
						<span className="text-sm text-gray-600">{l.xp} {t.leaderboard.xpSuffix()}</span>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
