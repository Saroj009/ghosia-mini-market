import React from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View, Platform } from 'react-native';

// Replace this with your MacBook's IP address (find it by running: ipconfig getifaddr en0)
const API_URL = 'http://192.168.1.5:5173'; // CHANGE THIS TO YOUR IP!

export default function App() {
  return (
    <View style={styles.container}>
      <WebView 
        source={{ uri: API_URL }} 
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 40 : 0,
  },
  webview: {
    flex: 1,
  },
});
