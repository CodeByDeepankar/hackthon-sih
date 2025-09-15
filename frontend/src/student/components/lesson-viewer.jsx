import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, Star, Clock, Award, Volume2 } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useI18n } from "@/i18n/useI18n";

export default function LessonViewer() {
	const { t } = useI18n();
	const [step, setStep] = useState(1);
	const total = 3;
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> {t.lesson.title()}</CardTitle>
			</CardHeader>
			<CardContent>
				<Progress value={(step / total) * 100} className="h-2 mb-4" />
				<div className="flex items-center justify-between">
					<Button variant="outline" size="sm" onClick={() => setStep(Math.max(1, step - 1))}><ChevronLeft className="w-4 h-4" /> {t.common.prev()}</Button>
					<div className="text-sm text-gray-600">{t.lesson.stepOf({ step, total })}</div>
					<Button size="sm" onClick={() => setStep(Math.min(total, step + 1))}>{t.common.next()} <ChevronRight className="w-4 h-4" /></Button>
				</div>
			</CardContent>
		</Card>
	);
}
