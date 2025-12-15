import { Home, Compass, Settings } from "lucide-react";
import { cn } from "../lib/utils";

interface LayoutProps {
    children: React.ReactNode;
    activeTab: 'dashboard' | 'qibla' | 'settings';
    onTabChange: (tab: 'dashboard' | 'qibla' | 'settings') => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between px-4 truncate">
                    <div className="mr-4 flex items-center space-x-2">
                        <span className="font-bold sm:inline-block">Uyan!</span>
                    </div>
                    <div className="flex flex-1 items-center justify-end space-x-2">
                        {/* Header Actions if needed */}
                    </div>
                </div>
            </header>

            <main className="flex-1 container px-4 py-6 pb-20">
                {children}
            </main>

            <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <nav className="flex justify-around p-2">
                    <button
                        onClick={() => onTabChange('dashboard')}
                        className={cn("flex flex-col items-center justify-center p-2 rounded-lg transition-colors", activeTab === 'dashboard' ? "text-primary" : "text-muted-foreground")}
                    >
                        <Home className="h-6 w-6" />
                        <span className="text-xs mt-1">Ana Sayfa</span>
                    </button>
                    <button
                        onClick={() => onTabChange('qibla')}
                        className={cn("flex flex-col items-center justify-center p-2 rounded-lg transition-colors", activeTab === 'qibla' ? "text-primary" : "text-muted-foreground")}
                    >
                        <Compass className="h-6 w-6" />
                        <span className="text-xs mt-1">Kıble</span>
                    </button>
                    <button
                        onClick={() => onTabChange('settings')}
                        className={cn("flex flex-col items-center justify-center p-2 rounded-lg transition-colors", activeTab === 'settings' ? "text-primary" : "text-muted-foreground")}
                    >
                        <Settings className="h-6 w-6" />
                        <span className="text-xs mt-1">Ayarlar</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}
