import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { SubHeader } from "./sub-header";
import { Calculator, Beaker, Book, Globe, Clock, Users, Star, Play } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useI18n } from "@/i18n/useI18n";

export default function CourseSelection() {
	const { t } = useI18n();
	// Keep four slots for the image-only cards; metadata retained for alt text only
	const courses = [
		{ id: 'Mathematics', title: t.courses.titles.mathematics() },
		{ id: 'Science', title: t.courses.titles.science() },
		{ id: 'Geography', title: t.courses.titles.geography() },
		{ id: 'More', title: t.common.more() },
	];

		const imageSources = [
			'/courses.img/s.png', // 1st card
			'/courses.img/t.png', // 2nd card
			'/courses.img/e.png', // 3rd card
			'/courses.img/m.png', // 4th card
		];

	return (
		<div className="space-y-4">
			<SubHeader showProgress showStreak user={{ streak: 7, xp: 620, xpToNextLevel: 1000, level: 10 }} />
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
						{courses.map((c, idx) => {
							const img = imageSources[idx] || imageSources[0];
							return (
																	<Card
																		key={c.id}
																		className="overflow-hidden cursor-pointer transition-transform duration-150 transform-gpu hover:scale-[1.02]"
																	>
															<CardContent className="p-0">
																<ImageWithFallback
																	src={img}
																	alt={c.title}
																	className="w-full h-auto block"
																/>
															</CardContent>
														</Card>
							);
						})}
					</div>
		</div>
	);
}
