import { StyleSheet, View, Image, ScrollView, TextInput, Modal } from 'react-native';
import {
  TYSdk,
  BrickButton,
  Utils,
  TYFlatList,
  Divider,
  TYListItem,
  Dialog,
  TYText,
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

const {
  convertX: cx,
  width: deviceWidth,
  height: deviceHeight,
  viewHeight,
  viewWidth,
  topBarHeight,
} = Utils.RatioUtils;

const Layout: React.FC = () => {
  const cRef = useRef(null);

  const product = useSelector(state => state.product);
  const dispatch = useDispatch();

  if (product.showFooter) {
    dispatch(actions.product.changeFooterVisible(false));
  }

  const [time, setTime] = React.useState({ startTime: 0, endTime: 0 });

  const defaultLoopDays: number[] = [];
  const [loopDays, setLoopDays] = React.useState(defaultLoopDays);
  const [timerSetting, setTimerSetting] = React.useState(null);
  const [recommendSource, setRecommendSource] = React.useState(null);

  const data = [
    {
      key: 0,
      title: Strings.getLang("time"),
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
          type: 'add-timer',
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
  const handleModalConfirm = ({ setting, img }) => {
    setTimerSetting(setting);
    if (img) {
      setRecommendSource(img);
    }
  };

  const handleTimerAdd = () => {
    if (time.startTime > time.endTime) {
      return GlobalToast.show({
        text: '开始时间不能大于结束时间',
        showIcon: false,
      });
    }
    if (!timerSetting) {
      return GlobalToast.show({
        text: '请设置灯光',
        showIcon: false,
      });
    }
    dispatch(
      actions.product.addTimer({
        timer: {
          startTime: time.startTime,
          endTime: time.endTime,
          running: false,
          loopDays: loopDays,
          setting: timerSetting,
          img: recommendSource,
        },
      })
    );
    setTimeout(() => {
      TYSdk.Navigator.pop();
    }, 100);
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
        onPress={() => handleTimerAdd()}
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
