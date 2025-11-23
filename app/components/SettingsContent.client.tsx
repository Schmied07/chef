import { useState } from 'react';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { ApiKeyCard } from '~/components/settings/ApiKeyCard';
import { ThemeCard } from '~/components/settings/ThemeCard';
import { ProfileCard } from '~/components/settings/ProfileCard';
import { UsageCard } from '~/components/settings/UsageCard';
import { Toaster } from '~/components/ui/Toaster';
import { UserProvider } from '~/components/UserProvider';

type TabType = 'profile' | 'usage' | 'apikeys' | 'preferences';

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const tabs = [
    { id: 'profile' as TabType, label: 'Profil', icon: '👤' },
    { id: 'usage' as TabType, label: 'Utilisation', icon: '📊' },
    { id: 'apikeys' as TabType, label: 'Clés API', icon: '🔑' },
    { id: 'preferences' as TabType, label: 'Préférences', icon: '⚙️' },
  ];

  return (
    <UserProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-bolt-elements-background-depth-2 dark:to-gray-900">
        <div className="mx-auto max-w-6xl px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-full p-2 text-blue-600 transition-all hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
              title="Retour au Chat"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </a>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600">
                Paramètres
              </h1>
              <p className="mt-1 text-sm text-content-secondary">Gérez votre profil et vos préférences</p>
            </div>
          </div>

          {/* Navigation par onglets */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex gap-2 border-b border-blue-200 dark:border-blue-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group relative flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all duration-200
                    ${activeTab === tab.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                    }
                  `}
                >
                  <span className="text-lg transition-transform group-hover:scale-110">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Contenu des onglets */}
          <div className="space-y-6 animate-fadeIn">
            {activeTab === 'profile' && <ProfileCard />}
            {activeTab === 'usage' && <UsageCard />}
            {activeTab === 'apikeys' && <ApiKeyCard />}
            {activeTab === 'preferences' && <ThemeCard />}
          </div>
        </div>
        <Toaster />
      </div>
    </UserProvider>
  );
}
