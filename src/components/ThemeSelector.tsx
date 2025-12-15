import { useApp } from "../context/AppContext";

const COLORS = [
    { id: 'blue', color: '#3b82f6', name: 'Mavi' },
    { id: 'green', color: '#22c55e', name: 'Yeşil' },
    { id: 'red', color: '#ef4444', name: 'Kırmızı' },
    { id: 'violet', color: '#8b5cf6', name: 'Mor' },
    { id: 'orange', color: '#f97316', name: 'Turuncu' },
    { id: 'gray', color: '#71717a', name: 'Gri' },
];

export function ThemeSelector() {
    const { themeColor, setThemeColor } = useApp();

    return (
        <div className="space-y-3">
            <h3 className="text-lg font-medium">Tema Rengi</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
                {COLORS.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => setThemeColor(c.id)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${themeColor === c.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : ''}`}
                        style={{ backgroundColor: c.color }}
                        title={c.name}
                    >
                        {themeColor === c.id && <span className="text-white font-bold text-xs">✓</span>}
                    </button>
                ))}
            </div>
        </div>
    );
}
