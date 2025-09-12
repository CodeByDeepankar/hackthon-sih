import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { SubHeader } from "./sub-header";
import { Calculator, Beaker, Book, Globe, Clock, Users, Star, Play } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export default function CourseSelection() {
	const courses = [
		{ id: 'mathematics', title: 'Mathematics', description: 'Master numbers and problem-solving', progress: 65, difficulty: 'Intermediate' },
		{ id: 'science', title: 'Science & Nature', description: 'Explore the natural world', progress: 40, difficulty: 'Beginner' },
		{ id: 'geography', title: 'Geography', description: 'Discover our world', progress: 20, difficulty: 'Beginner' },
	];

	return (
		<div className="space-y-4">
			<SubHeader showProgress showStreak user={{ streak: 7, xp: 620, xpToNextLevel: 1000, level: 10 }} />
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{courses.map((c) => (
					<Card key={c.id}>
									<CardHeader>
										<CardTitle className="flex items-center justify-between">
											<span className="light:text-black">{c.title}</span>
											<Badge variant="secondary" className="light:text-black">{c.difficulty}</Badge>
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-gray-600 light:text-black/80 mb-3">{c.description}</p>
							<Progress value={c.progress} className="h-2" />
							<div className="flex items-center justify-between mt-3 text-sm">
											<span className="text-gray-500 light:text-black/80">{c.progress}% complete</span>
											<Button size="sm" className="gap-2 light:text-black"><Play className="w-4 h-4" /> Continue</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
