import _ from 'lodash';
import { StyleSheet, View, Image, ScrollView } from 'react-native';
import { TYSdk, Utils, Button, TYText, Slider, Stepper, SwitchButton } from 'tuya-panel-kit';
import React from 'react';
import { commonStyles } from 'style/common';

// import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';

// import { useSettingConfig } from './service';

import { color } from '@config';
import Res from '@res';

const { convertX: cx, width: deviceWidth, height: deviceHeight } = Utils.RatioUtils;

const defaultConfig = {
  recommend: [
    {
      text: 'R:B=1:1',
      setting: {
        red_bright_value: 10,
        blue_bright_value: 10,
        purple_bright_value: 10,
        uvc_bright_value: 10,
        bright_value: 10,
      },
    },
    {
      text: 'R:B=1:2',
      setting: {
        red_bright_value: 10,
        blue_bright_value: 10,
        purple_bright_value: 10,
        uvc_bright_value: 10,
        bright_value: 20,
      },
    },
    {
      text: 'R:B=1:3',
      setting: {
        red_bright_value: 10,
        blue_bright_value: 10,
        purple_bright_value: 10,
        uvc_bright_value: 10,
        bright_value: 30,
      },
    },
    {
      text: 'R:B=1:4',
      setting: {
        red_bright_value: 10,
        blue_bright_value: 10,
        purple_bright_value: 10,
        uvc_bright_value: 10,
        bright_value: 40,
      },
    },
    {
      text: 'R:B=2:1',
      setting: {
        red_bright_value: 20,
        blue_bright_value: 10,
        purple_bright_value: 10,
        uvc_bright_value: 10,
        bright_value: 10,
      },
    },
    {
      text: 'R:B=2:2',
      setting: {
        red_bright_value: 30,
        blue_bright_value: 10,
        purple_bright_value: 10,
        uvc_bright_value: 10,
        bright_value: 10,
      },
    },
    {
      text: 'R:B=3:3',
      setting: {
        red_bright_value: 40,
        blue_bright_value: 10,
        purple_bright_value: 10,
        uvc_bright_value: 10,
        bright_value: 10,
      },
    },
    {
      text: 'R:B=4:4',
      setting: {
        red_bright_value: 50,
        blue_bright_value: 10,
        purple_bright_value: 10,
        uvc_bright_value: 10,
        bright_value: 10,
      },
    },
  ],
  schema: [
    'red_bright_value',
    'blue_bright_value',
    'purple_bright_value',
    'uvc_bright_value',
    'bright_value',
  ],
};

const Recommend: React.FC = () => {
  const handleButtonClick = setting => {
    TYSdk.device.putDeviceData(setting);
  };

  const renderButtonItems = defaultConfig.recommend.map(item => (
    <Button
      textStyle={styles.buttonItemText}
      style={styles.buttonItem}
      text={item.text}
      onPress={() => handleButtonClick(item.setting)}
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
      <View style={styles.buttonList}>{renderButtonItems}</View>
    </View>
  );
};

const Control: React.FC = () => {
  const dpState = useSelector(state => state.dpState);
  const devInfo = useSelector(state => state.devInfo);

  const getItemLabel = key => {
    if (devInfo.schema && devInfo.schema[key] && devInfo.schema[key].name) {
      return devInfo.schema[key].name;
    } else {
      return '';
    }
  };

  const getItemValue = key => {
    return Math.round(dpState[key] / 10);
  };

  const handleValueChange = _.debounce((key, value) => {
    TYSdk.device.putDeviceData({ [key]: Math.round(value) * 10 });
  }, 200);

  return (
    <View style={commonStyles.card}>
      <TYText text="自定义" size={18} />
      {defaultConfig.schema.map(key => (
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TYText style={{ width: cx(96) }} text={getItemLabel(key)} size={18} />
          <Slider.Horizontal
            theme={{
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
            style={{ width: cx(120), height: cx(36) }}
            value={getItemValue(key)}
            onSlidingComplete={v => handleValueChange(key, v)}
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
            value={getItemValue(key)}
            onValueChange={v => handleValueChange(key, v)}
          />
        </View>
      ))}
    </View>
  );
};

const Layout: React.FC = () => {
  const dpState = useSelector(state => state.dpState);

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
          value={dpState.switch_led}
          onValueChange={v => TYSdk.device.putDeviceData({ switch_led: v })}
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
