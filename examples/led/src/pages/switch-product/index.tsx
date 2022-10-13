import React from 'react';
import { View, SafeAreaView, ScrollView, Text, StyleSheet, AsyncStorage } from 'react-native';
import { Utils, Button, TYText } from 'tuya-panel-kit';

import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';

const { convertX: cx, width: deviceWidth, height: deviceHeight } = Utils.RatioUtils;

const productItems = [
  {
    label: '2-R-B',
    value: 'RB',
  },
  {
    label: '5-R-B-W-FR-UV',
    value: 'RBWFrUv',
  },
  {
    label: '3-R-B-FR',
    value: 'RBFr',
  },
  {
    label: '2-R-W',
    value: 'RW',
  },
];

const SwitchProduct: React.FC = () => {
  const productState = useSelector(state => state.product);
  const dispatch = useDispatch();

  const renderProductItems = productState =>
    productItems.map(item => {
      return (
        <Button
          size={24}
          style={[
            styles.productButton,
            productState.current === item.value ? styles.productButtonActive : null,
            // { backgroundColor: productState.current === item.value ? '#00FFFF' : '#000000' },
          ]}
          textStyle={styles.textStyle}
          text={item.label}
          onPress={() => dispatch(actions.product.changeCurrent(item.value))}
        />
      );
    });

  return <View style={styles.container}>{renderProductItems(productState)}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  productButton: {
    width: cx(160),
    height: cx(160),
    margin: cx(8),
    backgroundColor: '#000',
  },
  productButtonActive: {
    borderColor: 'red',
    borderWidth: cx(4),
    borderRadius: 8,
  },
  textStyle: {
    marginLeft: 12,
    color: '#FFFFFF',
  },
});

export default SwitchProduct;
