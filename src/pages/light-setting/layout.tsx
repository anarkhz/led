import { StyleSheet, View, Image, ScrollView } from 'react-native';
import { Utils, Button, TYText, Slider, Stepper, SwitchButton, Divider } from 'tuya-panel-kit';
import React from 'react';
import { commonStyles } from 'style/common';

import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';

import { useSettingConfig } from './service';

import { color } from '@config';

import Res from '@res';

const { convertX: cx, width: deviceWidth, height: deviceHeight } = Utils.RatioUtils;

const Recommend: React.FC = () => {
  const product = useSelector(state => state.product);
  const dispatch = useDispatch();

  const { recommend } = useSettingConfig(product.current);

  const renderButtonItems = list =>
    list.map(item => (
      <Button
        textStyle={styles.buttonItemText}
        style={styles.buttonItem}
        text={item.text}
        onPress={() => dispatch(actions.product.changeLightSetting(item.setting))}
      ></Button>
    ));

  return (
    <View style={commonStyles.card}>
      <TYText
        style={{
          fontSize: 18,
          marginBottom: cx(8),
          color: color.text,
        }}
        text="光质推荐"
      />
      <View style={styles.buttonList}>{renderButtonItems(recommend)}</View>
    </View>
  );
};

const Control: React.FC = () => {
  const product = useSelector(state => state.product);
  const dispatch = useDispatch();

  const { custom } = useSettingConfig(product.current);

  /**
   * 获取自定义项的值
   */
  const getValue = customItem => {
    const { key } = customItem;
    const current = product.current;
    if (product[`${current}_lightSetting`]) {
      return product[`${current}_lightSetting`][key] || 0;
    } else {
      return 0;
    }
  };

  /**
   * 更新自定义项的值
   */
  const handleCustomChange = (customItem, value) => {
    dispatch(
      actions.product.changeLightSetting({
        [customItem.key]: Math.round(value),
      })
    );
  };

  const renderCustomItem = customItem => {
    // const [value, setValue] = React.useState(props.value);
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TYText style={{ width: cx(48) }} text={customItem.label} size={18} />
        <Slider.Horizontal
          theme={{
            // width: 240,
            // height: 6,
            trackRadius: 3,
            trackHeight: 6,
            thumbSize: 26,
            thumbRadius: 26,
            thumbTintColor: '#FFF',
            minimumTrackTintColor: '#F84803',
            maximumTrackTintColor: '#E5E5E5',
          }}
          maximumValue={100}
          minimumValue={0}
          style={{ width: cx(160), height: cx(36) }}
          value={getValue(customItem)}
          onValueChange={v => handleCustomChange(customItem, v)}
        />
        <Stepper
          style={{
            width: cx(92),
          }}
          max={100}
          min={0}
          buttonStyle={styles.stepButtonStyle}
          inputStyle={styles.stepInputStyle}
          editable={true}
          value={getValue(customItem)}
          onValueChange={v => handleCustomChange(customItem, v)}
        />
      </View>
    );
  };

  // const renderCustom = list => list.map(item => renderCustomItem(item));
  const renderCustom = list => list.map(item => renderCustomItem(item));

  return (
    <View style={commonStyles.card}>
      <TYText text="自定义" size={18} />
      {renderCustom(custom)}
    </View>
  );
};

const Layout: React.FC = () => {
  const product = useSelector(state => state.product);
  const dispatch = useDispatch();

  const getSwitchValue = () => {
    const current = product.current;
    if (product[`${current}_switch`]) {
      return product[`${current}_switch`] || false;
    } else {
      return false;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <Recommend />
        <Image style={styles.banner} source={Res.cat} />
        <Control />
        <SwitchButton
          style={styles.switch}
          size={{
            activeSize: 34,
            margin: 3,
            width: 78,
            height: 40,
            borderRadius: 16,
          }}
          theme={{ onTintColor: '#57BCFB', onThumbTintColor: '#FFF' }}
          thumbStyle={{ width: 34, height: 34, borderRadius: 14 }}
          switchType="thumbMore"
          value={getSwitchValue()}
          onValueChange={v => dispatch(actions.product.changeSwitch(v))}
          tintColor="#E5E5E5"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  /**
   * Recommend
   */
  buttonList: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  buttonItem: {
    width: cx(72),
    height: cx(36),
    borderRadius: cx(4),
    // borderWidth: cx(1),
    backgroundColor: color.young,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.5,
    // shadowRadius: 8,
    elevation: 8,
    marginVertical: cx(6),
  },
  buttonItemText: {
    fontSize: cx(18),
    color: '#fff',
  },
  /**
   * Banner
   */
  banner: {
    alignSelf: 'center',
    width: deviceWidth - cx(32),
    marginVertical: cx(16),
  },
  /**
   * Control
   */
  stepButtonStyle: {
    width: cx(28),
  },
  stepInputStyle: {
    width: cx(24),
  },
  /**
   * Switch
   */
  switch: {
    alignSelf: 'flex-end',
    paddingHorizontal: cx(16),
    marginBottom: cx(36),
  },
});

export default Layout;
