import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { SubHeader } from "./sub-header";
import { Search, Sparkles } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useI18n } from "@/i18n/useI18n";

export default function SearchPage() {
    const { t } = useI18n();
	const [q, setQ] = useState("");
	const results = q ? [{ id: 1, title: 'Algebra Basics' }, { id: 2, title: 'Science Quiz #3' }] : [];
	return (
		<div className="space-y-4">
			<div className="flex gap-2">
				<Input value={q} onChange={e => setQ(e.target.value)} placeholder={t.search.placeholder()} />
				<Button><Search className="w-4 h-4" /></Button>
			</div>
			<div className="space-y-2">
				{results.map(r => (
					<Card key={r.id}><CardContent className="py-3">{r.title}</CardContent></Card>
				))}
				{!q && <div className="text-sm text-gray-500">{t.search.tryQuery({ term: 'Algebra' })}</div>}
			</div>
		</div>
	);
}
