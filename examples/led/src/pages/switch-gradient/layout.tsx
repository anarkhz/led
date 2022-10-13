import { StyleSheet, View, ScrollView, TextInput } from 'react-native';
import { Utils, Button, Popup, TYText, Slider, Stepper, SwitchButton } from 'tuya-panel-kit';
import React from 'react';

import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';

import { commonStyles } from 'style/common';
import { timeRecommend } from './service';

const { convertX: cx } = Utils.RatioUtils;

const Layout: React.FC = () => {
  const [inputVal, setInputVal] = React.useState('');

  const product = useSelector(state => state.product);
  const dispatch = useDispatch();

  function getTime() {
    const current = product.current;
    if (current) {
      return product[current + '_gradientTime'];
    } else {
      return 0;
    }
  }

  function handleTimeChange(time) {
    if (Math.round(time) !== getTime()) {
      dispatch(actions.product.changeGradientTime(Math.round(time)));
      if (Math.round(time) === 0) {
        setInputVal('');
      } else {
        setInputVal(Math.round(time).toString());
      }
    }
  }
  function handleInputChange(text) {
    if (Math.round(text) > 180) {
      dispatch(actions.product.changeGradientTime(180));
      setInputVal('180');
    } else if (Math.round(text) !== getTime()) {
      setInputVal(text);
      dispatch(actions.product.changeGradientTime(Math.round(text)));
    }
  }

  const renderButtons = timeRecommend.map(item => (
    <Button
      textStyle={styles.buttonItemText}
      style={styles.buttonItem}
      text={item + 'min'}
      onPress={() => handleTimeChange(item)}
    ></Button>
  ));

  return (
    <View style={commonStyles.card}>
      <View style={commonStyles.line}>
        <TYText>开关渐变</TYText>
        <TextInput
          style={styles.titleInput}
          keyboardType="numeric"
          maxLength={3}
          placeholder="请输入渐变时间（分钟）"
          value={inputVal}
          onChangeText={handleInputChange}
        ></TextInput>
      </View>
      <View style={[commonStyles.line, commonStyles.mt8]}>{renderButtons}</View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TYText style={{ paddingHorizontal: cx(16) }} text="R" size={18} />
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
          value={getTime()}
          onValueChange={handleTimeChange}
          // onSlidingComplete={v => setValue(Math.round(v))}
        />
        <Stepper
          style={{
            width: cx(92),
          }}
          max={180}
          min={0}
          buttonStyle={styles.stepButtonStyle}
          inputStyle={styles.stepInputStyle}
          value={getTime()}
          editable={true}
          onValueChange={handleTimeChange}
        />
      </View>
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
