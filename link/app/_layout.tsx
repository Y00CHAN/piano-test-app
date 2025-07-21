import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useState, createContext } from 'react';
import { NativeModules, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export const SharedYoutubeLinkContext = createContext<{ link: string | null; setLink: (l: string | null) => void }>({ link: null, setLink: () => {} });

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [sharedLink, setSharedLink] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android' && NativeModules.SharedLinkModule) {
      console.log('NativeModules.SharedLinkModule:', NativeModules.SharedLinkModule);
      NativeModules.SharedLinkModule.getSharedYoutubeLink().then((link: string) => {
        console.log('getSharedYoutubeLink result:', link);
        if (link && typeof link === 'string' && link.startsWith('http')) {
          setSharedLink(link);
        }
      });
    }
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <SharedYoutubeLinkContext.Provider value={{ link: sharedLink, setLink: setSharedLink }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack />
        <StatusBar style="auto" />
      </ThemeProvider>
    </SharedYoutubeLinkContext.Provider>
  );
}
