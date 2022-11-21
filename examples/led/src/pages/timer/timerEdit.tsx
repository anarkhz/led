import { StyleSheet, View, Image, ScrollView, TextInput, Modal } from 'react-native';
import {
  TYSdk,
  BrickButton,
  Utils,
  Divider,
  TYListItem,
  Dialog,
  Popup,
  // Modal,
  TimerPicker,
  GlobalToast,
} from 'tuya-panel-kit';
import React, { useRef } from 'react';

import { commonStyles } from 'style/common';
import { minToTimeStr, getLoopDaysLabel } from '@utils';

import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';

import { color } from '@config';
import Strings from '@i18n';
import LightSettingModal from '@components/lightSettingModal';

import { getTimerId } from './helper';
import { putSetTimer, putDeleteTimer } from './helper';

const { convertX: cx } = Utils.RatioUtils;

const Layout: React.FC = props => {
  console.log(props);
  const { editIndex } = props;
  const cRef = useRef(null);

  const product = useSelector(state => state.product);
  const dispatch = useDispatch();

  if (product.showFooter) {
    dispatch(actions.product.changeFooterVisible(false));
  }

  const { current } = product;

  const editTimer = product.timer[current][editIndex];

  const [time, setTime] = React.useState({
    startTime: editTimer.startTime,
    endTime: editTimer.endTime,
  });

  const defaultLoopDays: number[] = editTimer.loopDays;
  const [loopDays, setLoopDays] = React.useState(defaultLoopDays);
  const [timerSetting, setTimerSetting] = React.useState(editTimer.setting);
  const [timerMultiwaySwitch, setTimerMultiwaySwitch] = React.useState(editTimer.multiwaySwitch);
  const [recommendSource, setRecommendSource] = React.useState(editTimer.img);

  const data = [
    {
      key: 0,
      title: Strings.getLang('time'),
      arrow: true,
      onPress: () => {
        Popup.custom({
          content: (
            <View
              style={{
                height: 200,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
              }}
            >
              <TimerPicker
                startTime={time.startTime}
                endTime={time.endTime}
                onTimerChange={(startTime, endTime) => setTime({ startTime, endTime })}
                is12Hours={false}
              />
            </View>
          ),
          title: Strings.getLang('choose'),
          cancelText: Strings.getLang('cancel'),
          confirmText: Strings.getLang('confirm'),
          onMaskPress: ({ close }) => close(),
          onConfirm: (data, { close }) => {
            close();
          },
        });
      },
      Action: minToTimeStr(time.startTime) + ' - ' + minToTimeStr(time.endTime),
    },
    {
      key: 1,
      title: Strings.getLang('light_setting'),
      arrow: true,
      onPress: () => {
        cRef.current.open({
          type: 'edit-timer',
          setting: timerSetting,
          multiwaySwitch: timerMultiwaySwitch,
        });
      },
      Action: timerSetting ? Strings.getLang('has_setting') : Strings.getLang('no_setting'),
    },
    {
      key: 2,
      title: '循环',
      Action: getLoopDaysLabel(loopDays),
      arrow: true,
      onPress: () => {
        Popup.list({
          type: 'radio',
          dataSource: [
            {
              key: '0',
              title: Strings.getLang('loop_once'),
              value: 'once',
            },
            {
              key: '1',
              title: Strings.getLang('loop_every'),
              value: 'everyday',
            },
            {
              key: '2',
              title: Strings.getLang('custom_bright'),
              value: 'custom',
            },
          ],
          title: Strings.getLang('choose'),
          cancelText: Strings.getLang('cancel'),
          selectedIcon: <View></View>,
          footerType: 'singleCancel',
          onMaskPress: ({ close }) => close(),
          onSelect: (value, { close: popupClose }) => {
            if (value === 'once') {
              setLoopDays([]);
              popupClose();
            } else if (value === 'everyday') {
              setLoopDays([1, 2, 3, 4, 5, 6, 7]);
              popupClose();
            } else if (value === 'custom') {
              Dialog.checkbox({
                title: Strings.getLang('choose'),
                cancelText: Strings.getLang('cancel'),
                confirmText: Strings.getLang('confirm'),
                type: 'switch',
                maxItemNum: 7,
                value: loopDays,
                dataSource: [
                  {
                    value: 1,
                    title: Strings.getLang('mon'),
                    reverse: true,
                  },
                  {
                    value: 2,
                    title: Strings.getLang('tue'),
                    reverse: true,
                  },
                  {
                    value: 3,
                    title: Strings.getLang('wed'),
                    reverse: true,
                  },
                  {
                    value: 4,
                    title: Strings.getLang('thu'),
                    reverse: true,
                  },
                  {
                    value: 5,
                    title: Strings.getLang('fri'),
                    reverse: true,
                  },
                  {
                    value: 6,
                    title: Strings.getLang('sat'),
                    reverse: true,
                  },
                  {
                    value: 7,
                    title: Strings.getLang('sun'),
                    reverse: true,
                  },
                ],
                onConfirm: (value, { close: dialogClose }) => {
                  setLoopDays(value);
                  dialogClose();
                  popupClose();
                },
              });
            }
          },
        });
      },
    },
  ];

  /**
   * Handlers
   */
  const handleModalConfirm = ({ setting, img, multiwaySwitch }) => {
    setTimerSetting(setting);
    setTimerMultiwaySwitch(multiwaySwitch);
    if (img) {
      setRecommendSource(img);
    }
  };

  const handleTimerEdit = () => {
    if (time.endTime <= time.startTime) {
      return GlobalToast.show({
        text: '结束时间必须大于开始时间',
        showIcon: false,
      });
    }
    if (!timerSetting) {
      return GlobalToast.show({
        text: '请设置灯光',
        showIcon: false,
      });
    }

    function isTimeVaild() {
      const allRunningTimers = product.timer[current]?.filter(
        (item, index) => item.running && index !== editIndex
      );
      const runningDuration = allRunningTimers?.map(item => [item.startTime, item.endTime]);
      const target = runningDuration?.concat([time.startTime, time.endTime]);
      if (target && target.flat().sort().join() === target.flat().join()) {
        return true;
      } else {
        return false;
      }
    }

    if (editTimer.running && !isTimeVaild()) {
      return GlobalToast.show({
        text: '定时时间有冲突',
        showIcon: false,
      });
    }
    TYSdk.Navigator.pop();

    setTimeout(() => {
      dispatch(
        actions.product.changeTimer({
          index: editIndex,
          timer: {
            id: editTimer.id,
            startTime: time.startTime,
            endTime: time.endTime,
            running: editTimer.running,
            loopDays: loopDays,
            setting: timerSetting,
            multiwaySwitch: timerMultiwaySwitch,
            img: recommendSource,
          },
        })
      );
      putSetTimer(editTimer.id, editTimer, editTimer.running);
    }, 500);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* <TYText style={styles.title} text="定时设置"></TYText> */}
      <Divider />
      <TYListItem {...data[0]} />
      <Divider />
      <TYListItem {...data[1]} />
      <Divider />
      <TYListItem {...data[2]} />
      <BrickButton
        style={styles.confirmButton}
        text="保存"
        onPress={() => handleTimerEdit()}
        theme={{ bgColor: color.young }}
      />
      <LightSettingModal ref={cRef} onConfirm={options => handleModalConfirm(options)} />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    paddingHorizontal: cx(14),
    lineHeight: 32,
  },
  pickerContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: cx(16),
  },
  pickerTitle: {
    height: cx(32),
    // marginHorizontal: 24,
  },
  pickerLabel: {
    // marginHorizontal: cx(24),
  },
  confirmButton: {
    marginTop: cx(12),
    alignSelf: 'center',
  },
});

export default Layout;
