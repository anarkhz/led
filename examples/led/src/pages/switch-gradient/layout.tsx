import { StyleSheet, View, ScrollView, TextInput } from 'react-native';
import { TYSdk, Utils, Button, TYText, Slider, Stepper, Dialog } from 'tuya-panel-kit';
import React from 'react';

import { commonStyles } from 'style/common';
import { timeRecommend } from './service';
import { useSelector, actions } from '@models';
import {
  switchGradientToSecondTime,
  openTimeToText,
  openTimeToSecondTime,
  secondTimeToOpenTime,
} from './helpers';

const { convertX: cx } = Utils.RatioUtils;
import Strings from '@i18n';
const Layout: React.FC = () => {
  const dpState = useSelector(state => state.dpState);
  const secTime = switchGradientToSecondTime(dpState.switch_gradient);

  const [openTime, setOpenTime] = React.useState(secondTimeToOpenTime(secTime));
  const [inputTime, setInputTime] = React.useState('');

  /**
   * Handlers
   */
  function handleTimeChange(time) {
    setOpenTime(Math.round(time));
    // setSecondTime(openTimeToSecondTime(time));
  }

  function handleTimeComplete() {
    handlePutData(openTimeToSecondTime(openTime));
  }

  // time
  function handlePutData(time, format = 1000) {
    TYSdk.device.putDeviceData({
      switch_gradient:
        '00' +
        (Math.round(time) * format).toString(16).padStart(6, '0') +
        (Math.round(time) * format).toString(16).padStart(6, '0'),
    });
  }

  function handleOpenDialog() {
    Dialog.prompt({
      title: '请输入渐变时间（秒）',
      cancelText: '取消',
      confirmText: '确认',
      value: inputTime,
      placeholder: Strings.getLang('input_switch_gradient_hint'),
      keyboardType: 'numeric',
      inputMode: 'numeric',
      onChangeText: text => {
        console.log(text);
        // 使用value props 可令prompt成为受控组件，控制其输入框内容
        const t = +text;
        if (typeof t === 'number' && !Number.isNaN(t)) {
          if (Math.round(t) > 10800) {
            return '10800';
          } else {
            return text;
          }
        }
      },
      onConfirm: (text, { close }) => {
        const t = +text;
        setInputTime(t);
        setOpenTime(secondTimeToOpenTime(t));
        handlePutData(t);
        close();
      },
    });
  }

  /**
   * Renders
   */
  const renderHeader = () => {
    return (
      <View style={commonStyles.line}>
        <TYText text={Strings.getLang('switch_gradient')} size={18} />
      </View>
    );
  };

  const renderRecommend = () => {
    return (
      <View style={[commonStyles.line, commonStyles.mt8]}>
        {timeRecommend.map(item => (
          <Button
            textStyle={styles.buttonItemText}
            style={styles.buttonItem}
            text={item + 'min'}
            onPress={() => {
              setOpenTime(secondTimeToOpenTime(item * 60));
              handlePutData(item, 60 * 1000);
            }}
          ></Button>
        ))}
      </View>
    );
  };

  const renderSliderBar = () => {
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TYText style={{ paddingHorizontal: cx(16) }} text="时间" size={18} />
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
          maximumValue={181}
          minimumValue={0}
          style={{ width: cx(140), height: cx(36) }}
          value={openTime}
          onValueChange={handleTimeChange}
          onSlidingComplete={handleTimeComplete}
        />
        <TYText
          style={{
            width: cx(84),
            textAlign: 'center',
            backgroundColor: '#eee',
            padding: cx(4),
            borderRadius: cx(4),
          }}
          text={openTimeToText(openTime)}
          size={16}
          onPress={() => handleOpenDialog()}
        />
      </View>
    );
  };

  return (
    <View style={commonStyles.card}>
      {renderHeader()}
      {renderRecommend()}
      {renderSliderBar()}
    </View>
  );
};

const styles = StyleSheet.create({
  /* Title */
  titleInput: {
    width: cx(180),
    borderWidth: cx(1),
    borderColor: '#CCCCCC',
    paddingVertical: cx(4),
    paddingHorizontal: cx(6),
    textAlign: 'right',
  },
  /* Button List */
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
  /* Stepper */
  stepButtonStyle: {
    width: cx(28),
  },
  stepInputStyle: {
    width: cx(36),
  },
});

export default Layout;
