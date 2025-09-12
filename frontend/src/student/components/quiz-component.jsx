import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, Star, Trophy, Clock, Target, ChevronLeft, RotateCcw } from "lucide-react";

export default function QuizComponent() {
	const [index, setIndex] = useState(0);
	const questions = [
		{ q: '2 + 2 = ?', options: ['3', '4', '5'], answer: 1 },
		{ q: '5 x 3 = ?', options: ['8', '15', '10'], answer: 1 },
	];
	const q = questions[index];
	return (
		<Card>
			<CardHeader>
				<CardTitle>Quick Quiz</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="mb-3">{q.q}</p>
				<div className="space-y-2">
					{q.options.map((opt, i) => (
						<Button key={i} variant="outline" className="w-full justify-start">{opt}</Button>
					))}
				</div>
				<div className="flex justify-between mt-4">
					<Button variant="outline" size="sm" onClick={() => setIndex(Math.max(0, index - 1))}>Prev</Button>
					<Button size="sm" onClick={() => setIndex(Math.min(questions.length - 1, index + 1))}>Next</Button>
				</div>
			</CardContent>
		</Card>
	);
}
