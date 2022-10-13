import { StyleSheet, View, Image, ScrollView, TextInput } from 'react-native';
import {
  TYSdk,
  Utils,
  Button,
  Popup,
  TYText,
  Slider,
  Stepper,
  SwitchButton,
  TimerPicker,
  TYFlatList,
  Drawer,
} from 'tuya-panel-kit';
import React from 'react';

import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';

import { commonStyles } from 'style/common';
import { minToTimeStr, getLoopDaysLabel } from '@utils';

import Res from '@res';
import { dispatch } from 'rxjs/internal/observable/pairs';

const { convertX: cx, width: deviceWidth, height: deviceHeight } = Utils.RatioUtils;

const addIconPath =
  'M558.545455 240.48484804v217.212122h217.212121v93.090909H558.529939L558.545455 768.00000004h-93.09091l-0.015515-217.212121H248.242424v-93.090909h217.212121V240.48484804z';

const Layout: React.FC = () => {
  const product = useSelector(state => state.product);
  const dispatch = useDispatch();

  const getTimerList = () => {
    const current = product.current;
    if (current) {
      return product[current + '_timer'];
    } else {
      return [];
    }
  };

  const timerList = getTimerList();

  const handleTimerRunning = (index, item, running) => {
    dispatch(
      actions.product.changeTimer({
        index: index,
        timer: {
          ...item,
          running,
        },
      })
    );
  };

  const renderTimers = timerList.map((item, index) => {
    return (
      <View style={[commonStyles.card, styles.timerContainer]}>
        <Image style={styles.timerImg} resizeMode="contain" source={Res.cat} />
        <View style={styles.timerDesc}>
          <TYText
            style={styles.timeText}
            size={32}
            text={minToTimeStr(item.startTime) + ' - ' + minToTimeStr(item.endTime)}
          ></TYText>
          <View style={[commonStyles.line]}>
            <TYText style={{ maxWidth: 150 }} text={getLoopDaysLabel(item.loopDays)}></TYText>
            <SwitchButton
              value={item.running}
              onValueChange={v => handleTimerRunning(index, item, v)}
              tintColor="#E5E5E5"
              onTintColor={{
                '0%': '#FA709A',
                '100%': '#FEDD44',
              }}
            />
          </View>
        </View>
      </View>
    );
  });

  const AddTimerButton: React.FC = () => {
    // alert('nnnn');
    function handleAddTimer() {
      TYSdk.Navigator.push({
        id: 'timer-add',
      });
    }

    return (
      <Button
        iconColor="#fff"
        size={24}
        style={{
          width: cx(48),
          height: cx(48),
          borderRadius: cx(24),
          backgroundColor: '#1C1D1E',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.5,
          shadowRadius: 24,
          elevation: 8,
        }}
        wrapperStyle={{
          position: 'absolute',
          bottom: cx(32),
          right: cx(14),
        }}
        iconPath={addIconPath}
        onPress={handleAddTimer}
      />
    );
  };

  return (
    <View style={{ position: 'relative', width: deviceWidth, flex: 1 }}>
      <ScrollView>{renderTimers}</ScrollView>
      <AddTimerButton />
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerImg: {
    width: cx(110),
    height: cx(64),
    marginRight: cx(12),
  },
  timerDesc: {
    flex: 1,
  },
  timeText: {
    alignSelf: 'center',
    color: '#FFF',
  },
  sceneAddContainer: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
  sceneAddButton: {
    width: cx(72),
    height: cx(36),
    backgroundColor: '#409eff',
    borderRadius: cx(4),
  },
  sceneItems: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: cx(12),
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  sceneItem: {
    width: cx(100),
    height: cx(100),
    backgroundColor: '#409eff',
    borderRadius: cx(4),
    margin: cx(8),
  },
  sceneItemText: {
    fontSize: cx(18),
    color: '#fff',
  },
});

export default Layout;
