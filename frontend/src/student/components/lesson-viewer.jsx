import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, Star, Clock, Award, Volume2 } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export default function LessonViewer() {
	const [step, setStep] = useState(1);
	const total = 3;
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> Algebra Basics</CardTitle>
			</CardHeader>
			<CardContent>
				<Progress value={(step / total) * 100} className="h-2 mb-4" />
				<div className="flex items-center justify-between">
					<Button variant="outline" size="sm" onClick={() => setStep(Math.max(1, step - 1))}><ChevronLeft className="w-4 h-4" /> Prev</Button>
					<div className="text-sm text-gray-600">Step {step} of {total}</div>
					<Button size="sm" onClick={() => setStep(Math.min(total, step + 1))}>Next <ChevronRight className="w-4 h-4" /></Button>
				</div>
			</CardContent>
		</Card>
	);
}
