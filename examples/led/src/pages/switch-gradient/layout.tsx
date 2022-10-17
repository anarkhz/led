import { StyleSheet, View, ScrollView, TextInput } from 'react-native';
import { TYSdk, Utils, Button, TYText, Slider, Stepper } from 'tuya-panel-kit';
import React from 'react';

import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';

import { commonStyles } from 'style/common';
import { timeRecommend } from './service';

const { convertX: cx } = Utils.RatioUtils;
import Strings from '@i18n';
const Layout: React.FC = () => {
  const [openTime, setOpenTime] = React.useState(0);

  /**
   * Handlers
   */
  function handleTimeChange(time) {
    setOpenTime(Math.round(time));
    handlePutData(time);
  }

  function handleInputChange(text) {
    const time = Math.round(text) > 180 ? 180 : Math.round(text);
    setOpenTime(time);
    handlePutData(time);
  }

  function handlePutData(time) {
    TYSdk.device.putDeviceData({
      switch_gradient:
        '00' +
        (Math.round(time) * 60).toString(16).padStart(6, '0') +
        (Math.round(time) * 60).toString(16).padStart(6, '0'),
    });
  }

  /**
   * Renders
   */
  const renderHeader = () => {
    return (
      <View style={commonStyles.line}>
        <TYText text={Strings.getLang("switch_gradient")} size={18} />
        <TextInput
          style={styles.titleInput}
          keyboardType="numeric"
          maxLength={3}
          placeholder={Strings.getLang("input_switch_gradient_hint")}
          value={openTime.toString()}
          onChangeText={handleInputChange}
        ></TextInput>
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
            onPress={() => handleTimeChange(item)}
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
          maximumValue={180}
          minimumValue={0}
          style={{ width: cx(160), height: cx(36) }}
          value={openTime}
          onSlidingComplete={handleTimeChange}
        />
        <Stepper
          style={{
            width: cx(92),
          }}
          max={180}
          min={0}
          buttonStyle={styles.stepButtonStyle}
          inputStyle={styles.stepInputStyle}
          value={openTime}
          editable={true}
          onValueChange={handleTimeChange}
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
    width: cx(24),
  },
});

export default Layout;
