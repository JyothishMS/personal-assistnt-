import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jarvis.mobile',
  appName: 'JARVIS OS Mobile',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
