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

  const data = [
    {
      key: 0,
      title: '时间',
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
          title: '请选择',
          cancelText: '取消',
          confirmText: '确认',
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
      title: '灯光设置',
      arrow: true,
      onPress: () => {
        cRef.current.open({
          type: 'add-timer',
        });
      },
      Action: timerSetting ? '已设置' : '未设置',
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
              title: '一次',
              value: 'once',
            },
            {
              key: '1',
              title: '每天',
              value: 'everyday',
            },
            {
              key: '2',
              title: '自定义',
              value: 'custom',
            },
          ],
          title: '请选择',
          cancelText: '取消',
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
                title: 'Required',
                cancelText: '取消',
                confirmText: '确认',
                type: 'switch',
                maxItemNum: 7,
                value: loopDays,
                dataSource: [
                  {
                    value: 1,
                    title: '周一',
                    reverse: true,
                  },
                  {
                    value: 2,
                    title: '周二',
                    reverse: true,
                  },
                  {
                    value: 3,
                    title: '周三',
                    reverse: true,
                  },
                  {
                    value: 4,
                    title: '周四',
                    reverse: true,
                  },
                  {
                    value: 5,
                    title: '周五',
                    reverse: true,
                  },
                  {
                    value: 6,
                    title: '周六',
                    reverse: true,
                  },
                  {
                    value: 7,
                    title: '周日',
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

  const handleModalConfirm = setting => {
    setTimerSetting(setting);
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
        },
      })
    );
    setTimeout(() => {
      TYSdk.Navigator.pop();
    }, 100);
  };

  const renderSettingModal = () => {
    if (product.current) {
      return (
        <LightSettingModal
          ref={cRef}
          // visible={modalVisible}
          // onCancel={() => setModalVisible(false)}
          onConfirm={setting => handleModalConfirm(setting)}
        />
      );
    } else {
      return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TYText style={styles.title} text="定时设置"></TYText>
      <TYListItem {...data[0]} />
      <Divider />
      <TYListItem {...data[1]} />
      <Divider />
      <TYListItem {...data[2]} />
      <BrickButton style={styles.confirmButton} text="保存" onPress={() => handleTimerAdd()} />
      {renderSettingModal()}
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
