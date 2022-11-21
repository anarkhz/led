import { StyleSheet, View } from 'react-native';
import { TYText } from 'tuya-panel-kit';
import React from 'react';

import Layout from './layout';

import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';

const Component: React.FC = props => {
  const product = useSelector(state => state.product);
  const dispatch = useDispatch();

  if (!product.showFooter) {
    dispatch(actions.product.changeFooterVisible(true));
  }

  return (
    <View style={styles.container}>
      <Layout {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Component;
