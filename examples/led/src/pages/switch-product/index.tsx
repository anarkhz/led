import React from 'react';
import { View, SafeAreaView, ScrollView, Text, StyleSheet, AsyncStorage } from 'react-native';
import { TYSdk, Utils, Button, TYText } from 'tuya-panel-kit';

import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';
import { color, productConfig } from '@config';

const { convertX: cx, width: deviceWidth, height: deviceHeight } = Utils.RatioUtils;

const SwitchProduct: React.FC = () => {
  const product = useSelector(state => state.product);
  const dispatch = useDispatch();

  if (product.showFooter) {
    dispatch(actions.product.changeFooterVisible(false));
  }

  const handleButtonPress = item => {
    dispatch(actions.product.changeCurrent(item.value));
    setTimeout(() => {
      TYSdk.Navigator.pop();
    }, 0);
  };

  const renderProductItems = () =>
    productConfig.listSchema.map(item => {
      return (
        <Button
          size={24}
          style={[
            styles.productButton,
            product.current === item.value ? styles.productButtonActive : null,
          ]}
          textStyle={styles.textStyle}
          text={item.title}
          onPress={() => handleButtonPress(item)}
        />
      );
    });

  return <View style={styles.container}>{renderProductItems()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: color.dark,
  },
  productButtonActive: {
    borderColor: color.young,
    borderWidth: cx(4),
    borderRadius: 8,
  },
  textStyle: {
    marginLeft: 12,
    color: '#FFFFFF',
  },
});

export default SwitchProduct;
