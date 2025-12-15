import { useState } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { QiblaCompass } from "./components/QiblaCompass";
import { SettingsPage } from "./components/Settings";

function App() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'qibla' | 'settings'>('dashboard');

    return (
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'qibla' && <QiblaCompass />}
            {activeTab === 'settings' && <SettingsPage />}
        </Layout>
    );
}

export default App
