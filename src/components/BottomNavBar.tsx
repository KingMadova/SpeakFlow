import React from 'react';
import { Home, Compass, BookmarkCheck, User } from 'lucide-react';

export type NavTab = 'accueil' | 'explorer' | 'mes-mots' | 'profil';

interface BottomNavBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: 'accueil' as NavTab, label: 'Accueil', icon: Home },
    { id: 'explorer' as NavTab, label: 'Explorer', icon: Compass },
    { id: 'mes-mots' as NavTab, label: 'Mes mots', icon: BookmarkCheck },
    { id: 'profil' as NavTab, label: 'Profil', icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto bg-[#18181D]/95 backdrop-blur-md border-t border-[#2A2A32] px-3 py-2 flex items-center justify-around"
      aria-label="Navigation principale"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors relative ${
              isActive ? 'text-[#FF7A18]' : 'text-[#8E8E98] hover:text-[#C5C5CE]'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
            <span className={`text-[11px] font-medium ${isActive ? 'text-[#FF7A18]' : 'text-[#8E8E98]'}`}>
              {tab.label}
            </span>
            {tab.id === 'mes-mots' && (
              <span className="absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full bg-[#FF7A18]" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
