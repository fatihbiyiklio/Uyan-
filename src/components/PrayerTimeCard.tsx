import { Card } from "./ui/card";
import { cn } from "../lib/utils";

interface PrayerTimeCardProps {
    name: string;
    time: string;
    isNext?: boolean;
}

export function PrayerTimeCard({ name, time, isNext }: PrayerTimeCardProps) {
    return (
        <Card className={cn(
            "flex items-center justify-between p-4 transition-all duration-300",
            isNext ? "bg-primary text-primary-foreground scale-105 border-primary shadow-lg ring-2 ring-primary/20" : "hover:bg-accent/50"
        )}>
            <div className="text-lg font-medium">{name}</div>
            <div className={cn("text-2xl font-bold", isNext ? "text-primary-foreground" : "text-foreground")}>{time}</div>
        </Card>
    );
}
