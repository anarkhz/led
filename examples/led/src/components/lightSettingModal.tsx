import _ from 'lodash';
import { StyleSheet, View, Image, ScrollView, TextInput, Modal } from 'react-native';
import { TYSdk, Utils, Button, TYText, Slider, Stepper, Toast } from 'tuya-panel-kit';
import React, { forwardRef, useImperativeHandle } from 'react';

import { commonStyles } from 'style/common';

import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';

import { useSettingConfig } from '../pages/light-setting/service';

import { color } from '@config';
import Res from '@res';

const {
  convertX: cx,
  width: deviceWidth,
  height: deviceHeight,
  viewHeight,
  topBarHeight,
} = Utils.RatioUtils;

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
  setting: {
    red_bright_value: 100,
    blue_bright_value: 100,
    purple_bright_value: 100,
    uvc_bright_value: 100,
    bright_value: 100,
  },
};

const Layout: React.FC = forwardRef((props, ref) => {
  const dpState = useSelector(state => state.dpState);
  const devInfo = useSelector(state => state.devInfo);
  const product = useSelector(state => state.product);

  const { recommend, custom, defaultSetting } = useSettingConfig(product.current);

  const [visible, setVisible] = React.useState(false);
  const [setting, setSetting] = React.useState(() => defaultConfig.setting);
  const [name, setName] = React.useState(() => '');
  const [type, setType] = React.useState(() => 'common');

  const [myToast, setMyToast] = React.useState({ visible: false, text: '' });

  useImperativeHandle(ref, () => ({
    open,
  }));

  function open({ type = '', name = '', setting = defaultConfig.setting } = {}) {
    setType(type);
    setName(name);
    setSetting(setting);
    setVisible(true);
  }

  /**
   * 推荐组件
   */
  const Recommend: React.FC = () => {
    const renderButtonItems = defaultConfig.recommend.map(item => (
      <Button
        textStyle={styles.buttonItemText}
        style={styles.buttonItem}
        text={item.text}
        onPress={() => setSetting(item.setting)}
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

  /**
   * 自定义控制
   */
  const Control: React.FC = () => {
    const devInfo = useSelector(state => state.devInfo);

    const getItemLabel = key => {
      if (devInfo.schema && devInfo.schema[key] && devInfo.schema[key].name) {
        return devInfo.schema[key].name;
      } else {
        return '';
      }
    };

    const getItemValue = key => {
      return Math.round(setting[key] / 10);
    };

    const handleValueChange = _.debounce((key, value) => {
      setSetting({
        ...setting,
        [key]: Math.round(value) * 10,
      });
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

  const renderNameInput = () => {
    if (type === 'add-scene' || type === 'edit-scene') {
      return (
        <TextInput
          style={styles.name}
          maxLength={12}
          placeholder="请输入场景名称"
          value={name}
          onChangeText={v => setName(v)}
        />
      );
    } else {
      return null;
    }
  };

  const onCancel = function () {
    props.onCancel && props.onCancel();
    setVisible(false);
  };

  const onConfirm = function () {
    if (type === 'add-scene' || type === 'edit-scene') {
      if (name === '') {
        return setMyToast({
          text: '请输入场景名称',
          visible: true,
        });
      }
    }
    props.onConfirm && props.onConfirm({ type, setting, name });
    setVisible(false);
  };

  return (
    <Modal transparent={true} visible={visible} animationType="slide" onShow={() => {}}>
      <View
        style={{
          marginTop: topBarHeight - 44,
          height: viewHeight + 44,
          backgroundColor: '#FFF',
        }}
      >
        <ScrollView style={{ marginBottom: cx(56) }}>
          {renderNameInput()}
          <Recommend />
          <Image style={styles.banner} source={Res.cat} />
          <Control />
        </ScrollView>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            position: 'absolute',
            bottom: 0,
            width: deviceWidth,
            height: cx(56),
            backgroundColor: '#FFF',
          }}
        >
          <Button
            style={{
              width: deviceWidth / 2,
              alignSelf: 'stretch',
              height: cx(56),
            }}
            textStyle={{
              lineHeight: cx(56),
              fontSize: cx(16),
              color: 'rgba(0, 0, 0, 0.7)',
            }}
            text="取消"
            onPress={() => onCancel()}
          />
          <Button
            style={{
              width: deviceWidth / 2,
              alignSelf: 'stretch',
              height: cx(56),
            }}
            textStyle={{
              lineHeight: cx(56),
              fontSize: cx(16),
              color: '#FF4800',
            }}
            text="确认"
            onPress={() => onConfirm()}
          />
        </View>
      </View>
      <Toast
        showPosition="center"
        show={myToast.visible}
        text={myToast.text}
        onFinish={() => setMyToast({ text: '', visible: false })}
      />
    </Modal>
  );
});

const styles = StyleSheet.create({
  /**
   * Name
   */
  name: {
    marginTop: cx(12),
    width: cx(240),
    fontSize: cx(18),
    borderWidth: cx(1),
    borderColor: '#CCCCCC',
    paddingVertical: cx(4),
    paddingHorizontal: cx(6),
    textAlign: 'center',
    alignSelf: 'center',
  },
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
    borderWidth: cx(1),
    backgroundColor: '#1C1D1E',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
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
});

export default Layout;
