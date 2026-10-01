import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stackupholdem.heroes',
  appName: 'StackUp Heroes',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
