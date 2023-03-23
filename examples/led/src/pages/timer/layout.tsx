import _ from 'lodash';
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
import Strings from '@i18n';
import { putSetTimer, putDeleteTimer } from './helper';
const { convertX: cx, width: deviceWidth, height: deviceHeight } = Utils.RatioUtils;

const Layout: React.FC = props => {
  const dpState = useSelector(state => state.dpState);
  const devInfo = useSelector(state => state.devInfo);
  const product = useSelector(state => state.product);
  const { timer, current } = product;
  const dispatch = useDispatch();
  // const [editIndex, setEditIndex] = React.useState(0);

  const handleTimerRunning = (index, item, running) => {
    function isTimeVaild() {
      const { startTime, endTime } = item;
      const allRunningTimers = timer[current]?.filter(item => item.running);
      const runningDuration = allRunningTimers?.map(item => [item.startTime, item.endTime]);
      const target = runningDuration?.concat([[startTime, endTime]]);
      // console.log('allRunningTimers', allRunningTimers);
      // console.log('runningDuration', runningDuration);
      // console.log('target', target);
      if (allRunningTimers.length > 0) {
        const validStr1 = _.cloneDeep(target)
          .sort((a, b) => a[0] - b[0])
          .flat()
          .join();
        const validStr2 = _.cloneDeep(target)
          .flat()
          .sort((a, b) => a - b)
          .join();
        if (target && validStr1 === validStr2) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    }
    if (running && !isTimeVaild()) {
      return GlobalToast.show({
        text: '定时时间有冲突',
        showIcon: false,
      });
    }
    dispatch(
      actions.product.changeTimer({
        index: index,
        timer: {
          ...item,
          running,
        },
      })
    );
    putSetTimer(item.id, item, running);
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
        {
          key: '1',
          title: '编辑定时',
          value: 'edit',
        },
        {
          key: '2',
          title: Strings.getLang('del_timer'),
          value: 'delete',
        },
      ],
      title: Strings.getLang('choose'),
      cancelText: Strings.getLang('cancel'),
      // value: '',
      selectedIcon: <View></View>,
      footerType: 'singleCancel',
      onMaskPress: ({ close }) => close(),
      onSelect: (value, { close: popupClose }) => {
        if (value === 'delete') {
          Dialog.confirm({
            title: Strings.getLang('del_timer_question'),
            cancelText: Strings.getLang('cancel'),
            confirmText: Strings.getLang('confirm'),
            onConfirm: (data, { close: confirmClose }) => {
              dispatch(actions.product.deleteTimer({ index }));
              putDeleteTimer(item.id);
              confirmClose();
              popupClose();
            },
          });
        } else if (value === 'edit') {
          popupClose();
          setTimeout(() => {
            TYSdk.Navigator.push({
              id: 'timer-edit',
              editIndex: 0,
            });
          }, 500);
        }
      },
    });
  };

  /**
   * Handlers
   */
  function handleAddTimer() {
    if (timer[current] && timer[current].length >= 10) {
      return GlobalToast.show({
        text: '最多10个定时',
        showIcon: false,
      });
    }
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
                      size={28}
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
});

export default Layout;
