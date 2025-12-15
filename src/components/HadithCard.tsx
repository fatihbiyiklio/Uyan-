import { Quote } from "lucide-react";
import { Card } from "./ui/card";
import { getDailyHadith } from "../utils/hadiths";
import { useEffect, useState } from "react";

export function HadithCard() {
    const [hadith, setHadith] = useState<{ source: string, text: string } | null>(null);

    useEffect(() => {
        setHadith(getDailyHadith());
    }, []);

    if (!hadith) return null;

    return (
        <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2 text-primary">
                    <Quote className="h-5 w-5" />
                    <span className="font-semibold text-sm">Günün Hadisi</span>
                </div>
                <p className="text-sm italic font-medium leading-relaxed">
                    "{hadith.text}"
                </p>
                <p className="text-xs text-muted-foreground text-right font-medium">
                    — {hadith.source}
                </p>
            </div>
        </Card>
    );
}
