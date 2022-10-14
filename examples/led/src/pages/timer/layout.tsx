import { StyleSheet, View, Image, ScrollView, TouchableOpacity, TextInput } from 'react-native';
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
  Dialog,
  GlobalToast,
} from 'tuya-panel-kit';
import React from 'react';

import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';

import { color, icon } from '@config';

import { commonStyles } from 'style/common';
import { minToTimeStr, getLoopDaysLabel, binStrToHex } from '@utils';

const { convertX: cx, width: deviceWidth, height: deviceHeight } = Utils.RatioUtils;

const Layout: React.FC = () => {
  const dpState = useSelector(state => state.dpState);
  const devInfo = useSelector(state => state.devInfo);
  const product = useSelector(state => state.product);
  const { timer, current } = product;
  const dispatch = useDispatch();
  // const [editIndex, setEditIndex] = React.useState(0);

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

    const getBinWeek = () => {
      let result = [0, 0, 0, 0, 0, 0, 0, 0];
      item.loopDays.forEach(item => {
        result[item - 1] = 1;
      });
      return result.join('');
    };

    const rtc_bin_running = running ? '1' : '0';
    const rtc_bin_id = '0000000'; // id占位
    const rtc_hex_timer_type = '01';
    const rtc_bin_week = getBinWeek();
    const rtc_hex_time_type = '00';
    const rtc_hex_time = item.startTime.toString(16).padStart(2, '0'); // 先用startTime
    const rtc_hex_action = 'FFFFFFF'; // 参数有问题

    TYSdk.device.putDeviceData({
      rtc_timer:
        binStrToHex(rtc_bin_running + rtc_bin_id, 2) +
        rtc_hex_timer_type +
        binStrToHex(rtc_bin_week, 2) +
        rtc_hex_time_type +
        rtc_hex_time +
        rtc_hex_action,
      timer_report: binStrToHex(rtc_bin_running + rtc_bin_id, 2),
    });
  };
  const handleTimerPress = (item, index) => {
    Popup.list({
      type: 'radio',
      // maxItemNum: 7,
      dataSource: [
        // {
        //   key: '0',
        //   title: '应用场景',
        //   value: 'use',
        // },
        // {
        //   key: '1',
        //   title: '编辑场景',
        //   value: 'edit',
        // },
        {
          key: '2',
          title: '删除定时',
          value: 'delete',
        },
      ],
      title: '请选择',
      cancelText: '取消',
      // value: '',
      selectedIcon: <View></View>,
      footerType: 'singleCancel',
      onMaskPress: ({ close }) => close(),
      onSelect: (value, { close: popupClose }) => {
        if (value === 'delete') {
          Dialog.confirm({
            title: '确定要删除吗',
            cancelText: '取消',
            confirmText: '确认',
            onConfirm: (data, { close: confirmClose }) => {
              dispatch(actions.product.deleteTimer({ index }));
              confirmClose();
              popupClose();
            },
          });
        }
      },
    });
  };

  /**
   * Handlers
   */
  function handleAddTimer() {
    // if (timer[current].length >= 10) {
    //   return GlobalToast.show({
    //     text: '最多10个定时',
    //     showIcon: false,
    //   });
    // }
    TYSdk.Navigator.push({
      id: 'timer-add',
    });
  }

  /**
   * Renders
   */
  const renderTimers = () => {
    if (timer && timer[current] && timer[current].length > 0) {
      return (
        <View>
          {timer[current].map((item, index) => {
            const renderImage = () => {
              if (item.img) {
                return <Image style={styles.timerImg} resizeMode="contain" source={item.img} />;
              } else {
                return null;
              }
            };
            return (
              <TouchableOpacity activeOpacity={0.6} onPress={() => handleTimerPress(item, index)}>
                <View style={[commonStyles.card, styles.timerContainer]}>
                  {renderImage()}
                  <View style={styles.timerDesc}>
                    <TYText
                      style={styles.timeText}
                      size={32}
                      text={minToTimeStr(item.startTime) + ' - ' + minToTimeStr(item.endTime)}
                    ></TYText>
                    <View style={[commonStyles.line]}>
                      <TYText
                        style={{ maxWidth: 150 }}
                        text={getLoopDaysLabel(item.loopDays)}
                      ></TYText>
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
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }
  };

  const renderAddButton = () => {
    return (
      <View
        style={{
          position: 'absolute',
          bottom: cx(32),
          left: deviceWidth - cx(60),
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
      >
        <Button
          iconColor="#fff"
          style={{
            width: cx(48),
            height: cx(48),
          }}
          size={24}
          iconPath={icon.path.plus}
          onPress={handleAddTimer}
        />
      </View>
    );
  };

  return (
    <View style={{ position: 'relative', width: deviceWidth, flex: 1 }}>
      <ScrollView>{renderTimers()}</ScrollView>
      {renderAddButton()}
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
    color: color.dark,
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
