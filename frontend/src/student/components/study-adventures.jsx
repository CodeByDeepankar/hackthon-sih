import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { SubHeader } from "./sub-header";
import { Map, Compass, Treasure, Shield, Sword, Star, Crown, Gem, ChevronRight, Lock, Play, Clock, Users, CheckCircle, Award } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export default function StudyAdventures() {
	const adventures = [
		{ id: 1, title: 'Algebra Island', progress: 20 },
		{ id: 2, title: 'Physics Peak', progress: 5 },
	];
	return (
		<div className="space-y-4">
			<SubHeader showRewards nextLevelRewards={[{ icon: '🏆', name: 'Badge' }]} />
			<div className="grid gap-4 md:grid-cols-2">
				{adventures.map(a => (
					<Card key={a.id}>
						<CardHeader>
							<CardTitle>{a.title}</CardTitle>
						</CardHeader>
						<CardContent>
							<Progress value={a.progress} className="h-2" />
							<div className="flex justify-between mt-3 text-sm">
								<span className="text-gray-500">{a.progress}%</span>
								<Button size="sm">Open</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
