import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { YellowBox } from "react-native";
import { Provider } from "react-redux";
import store from "./redux/reducers/store";
import App from './src/index';

YellowBox.ignoreWarnings([
  "Warning: isMounted(...) is deprecated",
  "Module RCTImageLoader"
]);

export default () => (
  <Provider store={store}>
    <App />
  </Provider>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
