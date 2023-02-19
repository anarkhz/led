import _ from 'lodash';
import { StyleSheet, View, Image, ScrollView, TextInput, Modal } from 'react-native';
import {
  TYSdk,
  Utils,
  Button,
  TYText,
  Slider,
  Stepper,
  Toast,
  Divider,
  SwitchButton,
} from 'tuya-panel-kit';
import React, { forwardRef, useImperativeHandle } from 'react';

import { commonStyles } from 'style/common';

import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';

import { color, productConfig } from '@config';

import Res from '@res';
import Strings from '@i18n';

const { channelSchemaMap, schemaChanelMap } = productConfig.maps;
const { switchSchema } = productConfig;

const {
  convertX: cx,
  width: deviceWidth,
  height: deviceHeight,
  viewHeight,
  topBarHeight,
} = Utils.RatioUtils;

const Layout = forwardRef((props, ref) => {
  const devInfo = useSelector(state => state.devInfo);
  const current = useSelector(state => state.product.current);

  const [recommendSource, setRecommendSource] = React.useState(Res.cat);
  const [visible, setVisible] = React.useState(false);
  const [setting, setSetting] = React.useState(() => productConfig.defaultSetting[current]);
  const [name, setName] = React.useState(() => '');
  const [type, setType] = React.useState(() => 'common');
  const [multiwaySwitch, setMultiwaySwitch] = React.useState(
    () => productConfig.defaultSwitch[current]
  );

  const [myToast, setMyToast] = React.useState({ visible: false, text: '' });

  useImperativeHandle(ref, () => ({
    open,
  }));

  function open({
    type = '',
    name = '',
    setting = productConfig.defaultSetting[current],
    multiwaySwitch = productConfig.defaultSwitch[current],
  } = {}) {
    setType(type);
    setName(name);
    setSetting(setting);
    setVisible(true);
    setMultiwaySwitch(multiwaySwitch);
  }

  /**
   * Getters
   */
  const controlItemSwitchGetter = key => {
    if (multiwaySwitch[key]) {
      return multiwaySwitch[key];
    } else {
      return true;
    }
  };

  const controlItemLabelGetter = key => {
    if (devInfo.schema && devInfo.schema[key] && devInfo.schema[key].name) {
      return devInfo.schema[key].name;
    } else {
      return '';
    }
  };

  const controlItemValueGetter = key => {
    return Math.round(setting[key] / 10);
  };

  /**
   * Handlers
   */
  const handleRecommendPress = item => {
    TYSdk.device.putDeviceData(item.setting);
    setRecommendSource(item.img);
  };

  const handleControlValueChange = _.debounce((key, value) => {
    setSetting({
      ...setting,
      [key]: Math.round(value) * 10,
    });
    setRecommendSource(Res.cat);
  }, 200);

  const handleMultiwaySwitch = (key, value) => {
    setMultiwaySwitch({
      ...multiwaySwitch,
      [key]: value,
    });
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
    props.onConfirm &&
      props.onConfirm({ type, setting, name, img: recommendSource, multiwaySwitch });
    setVisible(false);
  };

  /**
   * Renders
   */
  const renderNameInput = () => {
    if (type === 'add-scene' || type === 'edit-scene') {
      return (
        <View style={[commonStyles.card, commonStyles.line]}>
          <TYText text="场景名称" size={18} />
          <TextInput
            style={styles.name}
            maxLength={12}
            placeholder="请输入场景名称"
            value={name}
            onChangeText={v => setName(v)}
          />
        </View>
      );
    } else {
      return null;
    }
  };

  const renderRecommend = recommendConfig => {
    if (recommendConfig && recommendConfig.list && recommendConfig.list.length > 0) {
      return (
        <View style={commonStyles.card}>
          <TYText
            style={{
              fontSize: 18,
              marginBottom: cx(8),
              color: color.text,
            }}
            // text={Strings.getLang('recommend_light')}
            text={recommendConfig.title}
          />
          <View style={styles.buttonList}>
            {recommendConfig.list.map(item => (
              <Button
                textStyle={styles.buttonItemText}
                style={styles.buttonItem}
                text={item.text}
                onPress={() => handleRecommendPress(item)}
              ></Button>
            ))}
          </View>
        </View>
      );
    } else {
      return null;
    }
  };

  const renderRecommendItems = () => {
    const renderComponent = productConfig.recommend[current].map(item => renderRecommend(item));
    return (
      <View>
        {renderComponent}
        <View style={commonStyles.card}>
          <TYText
            style={{
              fontSize: 18,
              marginBottom: cx(8),
              color: color.text,
            }}
            // text={Strings.getLang('recommend_light')}
            text={'光谱参考'}
          />
          <Image style={styles.banner} source={recommendSource} />
        </View>
      </View>
    );
  };

  const renderControl = () => {
    return (
      <View style={commonStyles.card}>
        <TYText
          style={{
            marginBottom: 12,
          }}
          text={Strings.getLang('custom_bright')}
          size={18}
        />
        {productConfig.controlSchema[current].map(key => (
          <View>
            <Divider style={{ marginVertical: 12 }}></Divider>
            <View
              style={{
                height: 40,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <TYText style={{ width: cx(96) }} text={controlItemLabelGetter(key)} size={18} />
              <SwitchButton
                style={{
                  display: switchSchema[current].includes(key) ? 'flex' : 'none',
                }}
                value={multiwaySwitch[key]}
                size={{
                  activeSize: 18,
                  margin: 5,
                  width: 52,
                  height: 28,
                  borderRadius: 10,
                }}
                theme={{ onTintColor: '#57BCFB', onThumbTintColor: '#FFF' }}
                thumbStyle={{ width: 18, height: 18, borderRadius: 6 }}
                onText="ON"
                offText="OFF"
                onValueChange={v => handleMultiwaySwitch(key, v)}
              />
            </View>
            <View
              style={{
                display:
                  !switchSchema[current].includes(key) || multiwaySwitch[key] ? 'flex' : 'none',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
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
                minimumValue={1}
                style={{ width: cx(180), height: cx(36) }}
                value={controlItemValueGetter(key)}
                onSlidingComplete={v => handleControlValueChange(key, v)}
              />
              <Stepper
                style={{
                  width: cx(92),
                }}
                max={100}
                min={1}
                buttonStyle={styles.stepButtonStyle}
                inputStyle={styles.stepInputStyle}
                editable={true}
                value={controlItemValueGetter(key)}
                onValueChange={v => handleControlValueChange(key, v)}
              />
            </View>
          </View>
        ))}
      </View>
    );
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
          {renderRecommendItems()}
          {renderControl()}
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
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -1,
            },
            shadowOpacity: 0.2,
            shadowRadius: 8,
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
    // marginTop: cx(12),
    width: cx(240),
    fontSize: cx(18),
    borderWidth: cx(1),
    borderColor: '#CCCCCC',
    paddingVertical: cx(4),
    paddingHorizontal: cx(6),
    // textAlign: 'center',
    // alignSelf: 'center',
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
    height: cx(160),
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
