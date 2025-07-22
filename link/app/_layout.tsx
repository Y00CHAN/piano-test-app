import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createContext, useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import 'react-native-reanimated';

export const SharedYoutubeLinkContext = createContext<{ link: string | null; setLink: (l: string | null) => void }>({ link: null, setLink: () => {} });

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [sharedLink, setSharedLink] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'android' && NativeModules.SharedLinkModule) {
      NativeModules.SharedLinkModule.getSharedYoutubeLink().then((link: string) => {
        if (link && typeof link === 'string' && link.startsWith('http')) {
          setSharedLink(link);
        }
      });

      // NativeEventEmitter 인자 없이 사용, addListener 체크 없이 항상 등록
      const eventEmitter = new NativeEventEmitter();
      const subscription = eventEmitter.addListener('onSharedYoutubeLink', (link) => {
        console.log('onSharedYoutubeLink 이벤트 수신:', link);
        if (link && typeof link === 'string' && link.startsWith('http')) {
          setSharedLink(link);
        }
      });
      if (typeof NativeModules.SharedLinkModule.emitLatestLink === 'function') {
        console.log('emitLatestLink 호출!');
        NativeModules.SharedLinkModule.emitLatestLink();
      }
      return () => subscription.remove();
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
