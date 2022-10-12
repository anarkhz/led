import { StyleSheet, View, Image, ScrollView, TextInput, Modal } from 'react-native';
import {
  TYSdk,
  Utils,
  Button,
  TYText,
  Slider,
  Stepper,
  SwitchButton,
  Divider,
} from 'tuya-panel-kit';
import React, { forwardRef, useImperativeHandle } from 'react';

import { commonStyles } from 'style/common';

import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';

import { useSettingConfig } from '../pages/light-setting/service';

import Res from '@res';

const {
  convertX: cx,
  width: deviceWidth,
  height: deviceHeight,
  viewHeight,
  topBarHeight,
} = Utils.RatioUtils;

const Layout: React.FC = forwardRef((props, ref) => {
  const product = useSelector(state => state.product);
  const dispatch = useDispatch();

  const { recommend, custom, defaultSetting } = useSettingConfig(product.current);

  const [visible, setVisible] = React.useState(false);
  const [setting, setSetting] = React.useState(() => defaultSetting);
  const [name, setName] = React.useState(() => '');
  const [type, setType] = React.useState(() => 'common');

  useImperativeHandle(ref, () => ({
    open,
  }));

  function open({ type = '', name = '', setting = defaultSetting } = {}) {
    setType(type || '');
    setName(name || '');
    setSetting(setting || {});
    setVisible(true);
  }

  // const defaultConfig = getDefaultConfig();
  // setTimeout(() => {
  //   setSetting(defaultConfig.setting);
  //   setName(defaultConfig.name);
  // }, 0);

  // alert(name);

  /**
   * 推荐组件
   */
  const Recommend: React.FC = () => {
    const renderButtonItems = list =>
      list.map(item => (
        <Button
          textStyle={styles.buttonItemText}
          style={styles.buttonItem}
          text={item.text}
          onPress={() => setSetting(item.setting)}
        ></Button>
      ));

    return (
      <View style={commonStyles.card}>
        <TYText text="光质推荐" size={18} />
        <View style={styles.buttonList}>{renderButtonItems(recommend)}</View>
      </View>
    );
  };

  /**
   * 自定义控制
   */
  const Control: React.FC = () => {
    /**
     * 获取自定义项的值
     */
    const getValue = customItem => {
      const { key } = customItem;
      return setting[key];
    };

    /**
     * 更新自定义项的值
     */
    const handleCustomChange = (customItem, value) => {
      setSetting({
        ...setting,
        [customItem.key]: Math.round(value),
      });
    };

    const renderCustomItem = customItem => {
      return (
        <View style={commonStyles.line}>
          <TYText style={{ width: cx(48) }} text={customItem.label} size={18} />
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
            style={{ width: cx(160), height: cx(36) }}
            value={getValue(customItem)}
            onSlidingComplete={v => handleCustomChange(customItem, v)}
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

    const renderCustom = list => list.map(item => renderCustomItem(item));

    return (
      <View style={commonStyles.card}>
        <TYText text="自定义" size={18} />
        {renderCustom(custom)}
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
