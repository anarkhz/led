import { StyleSheet, View } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import React from 'react';

import Layout from './layout';

const Component: React.FC = () => {
  return (
    <View style={styles.container}>
      <Layout></Layout>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});

export default Component;
