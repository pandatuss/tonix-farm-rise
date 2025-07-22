import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import WebApp from '@twa-dev/sdk';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface TelegramContextType {
  user: TelegramUser | null;
  webApp: typeof WebApp | null;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  webApp: null,
  isReady: false,
});

export const useTelegram = () => useContext(TelegramContext);

interface TelegramProviderProps {
  children: ReactNode;
}

export const TelegramProvider = ({ children }: TelegramProviderProps) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      // Initialize Telegram Web App
      WebApp.ready();
      WebApp.expand();
      
      // Set theme to dark
      WebApp.setHeaderColor('#1a1a2e');
      WebApp.setBackgroundColor('#1a1a2e');
      
      // Get user data
      const tgUser = WebApp.initDataUnsafe?.user;
      if (tgUser) {
        setUser({
          id: tgUser.id,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name,
          username: tgUser.username,
          language_code: tgUser.language_code,
          is_premium: tgUser.is_premium,
          photo_url: tgUser.photo_url,
        });
      } else {
        // Fallback for development
        setUser({
          id: 12345,
          first_name: 'TONIX',
          username: 'tonixuser',
          photo_url: undefined,
        });
      }
      
      setIsReady(true);
    } catch (error) {
      console.error('Telegram WebApp initialization failed:', error);
      // Fallback for development
      setUser({
        id: 12345,
        first_name: 'TONIX',
        username: 'tonixuser',
        photo_url: undefined,
      });
      setIsReady(true);
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ user, webApp: WebApp, isReady }}>
      {children}
    </TelegramContext.Provider>
  );
};