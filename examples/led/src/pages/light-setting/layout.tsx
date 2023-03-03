import _ from 'lodash';
import { StyleSheet, View, Image, ScrollView } from 'react-native';
import {
  TYSdk,
  Utils,
  Button,
  TYText,
  Slider,
  Stepper,
  SwitchButton,
  Popup,
  Dialog,
  Divider,
} from 'tuya-panel-kit';
import React from 'react';
import { commonStyles } from 'style/common';

import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';

import { color, productConfig } from '@config';
import Res from '@res';
import Strings from '@i18n';

import { slowStart } from '@utils/slowStart';

const { channelSchemaMap, schemaChanelMap } = productConfig.maps;
const { switchSchema } = productConfig;
// const { defaultSetting} = productConfig.defaultSetting;

const { convertX: cx, width: deviceWidth, height: deviceHeight } = Utils.RatioUtils;

const Layout: React.FC = () => {
  const dpState = useSelector(state => state.dpState);
  const devInfo = useSelector(state => state.devInfo);
  const current = useSelector(state => state.product.current);
  const dispatch = useDispatch();
  const [recommendSource, setRecommendSource] = React.useState(Res.cat);

  function changeWorkMode() {
    if (dpState.work_mode !== 'white') {
      TYSdk.device.putDeviceData({
        work_mode: 'white',
      });
    }
  }

  /**
   * Getters
   */
  const multiwaySwitchGetter = () => {
    const multiway_switch = dpState.multiway_switch;
    if (!multiway_switch || multiway_switch.length === 0) return;
    const result = {};
    const valueMap = {
      '00': false,
      '01': true,
    };

    for (let i = 0; i < multiway_switch.length; i += 4) {
      const keyStr = multiway_switch.substr(i, 2);
      const valueStr = multiway_switch.substr(i + 2, 2);
      const channel = channelSchemaMap[keyStr];
      const value = valueMap[valueStr];
      if (result[channel] === undefined) result[channel] = value;
    }
    return result;
  };

  const controlItemSwitchGetter = key => {
    if (dpState.multiway_switch) {
      const multiwaySwitch = multiwaySwitchGetter();
      if (multiwaySwitch) return multiwaySwitch[key];
      return true;
    } else {
      return true;
    }
  };

  const controlItemLabelGetter = key => {
    if (devInfo.schema && devInfo.schema[key] && devInfo.schema[key].name) {
      return devInfo.schema[key].name;
    } else {
      return '';
    }
  };

  const controlItemValueGetter = key => {
    return Math.round(dpState[key] / 10);
  };

  /**
   * Handlers
   */
  const handleRecommendPress = item => {
    changeWorkMode();
    slowStart(item.setting);
    // TYSdk.device.putDeviceData(item.setting);
    setRecommendSource(item.img);
  };

  const handleControlValueChange = _.debounce((key, value) => {
    changeWorkMode();
    TYSdk.device.putDeviceData({ [key]: Math.round(value) * 10 });
    if (current == 'RB') {
      if (key == 'red_bright_value') {
        if (
          controlItemValueGetter('blue_bright_value') == 1 ||
          controlItemValueGetter('red_bright_value') == 1
        ) {
          setRecommendSource(Res.recommend.RBR);
        } else {
          setRecommendSource(Res.recommend.RBRB);
        }
      } else if (key == 'blue_bright_value') {
        if (
          controlItemValueGetter('red_bright_value') == 1 ||
          controlItemValueGetter('blue_bright_value') == 1
        ) {
          setRecommendSource(Res.recommend.RBB);
        } else {
          setRecommendSource(Res.recommend.RBRB);
        }
      }
    } else if (current == 'RW') {
      if (key == 'red_bright_value') {
        if (
          controlItemValueGetter('bright_value') == 1 ||
          controlItemValueGetter('red_bright_value') == 1
        ) {
          setRecommendSource(Res.recommend.RWR);
        } else {
          setRecommendSource(Res.recommend.RWRW);
        }
      } else if (key == 'bright_value') {
        if (
          controlItemValueGetter('red_bright_value') == 1 ||
          controlItemValueGetter('bright_value') == 1
        ) {
          setRecommendSource(Res.recommend.RWW);
        } else {
          setRecommendSource(Res.recommend.RWRW);
        }
      }
    }
  }, 200);

  const handlePressMore = () => {
    Popup.list({
      type: 'radio',
      dataSource: [
        {
          key: '0',
          title: Strings.getLang('change_product'),
          value: 'switch-product',
        },
      ],
      title: Strings.getLang('choose'),
      cancelText: Strings.getLang('cancel'),
      selectedIcon: <View></View>,
      footerType: 'singleCancel',
      onMaskPress: ({ close }) => close(),
      onSelect: (value, { close: popupClose }) => {
        if (value === 'switch-product') {
          Dialog.checkbox({
            title: Strings.getLang('choose'),
            cancelText: Strings.getLang('cancel'),
            confirmText: Strings.getLang('confirm'),
            type: 'radio',
            maxItemNum: 7,
            value: current,
            dataSource: productConfig.listSchema,
            onConfirm: (value, { close: dialogClose }) => {
              dispatch(actions.product.changeCurrent(value));
              // setLoopDays(value);
              dialogClose();
              popupClose();
            },
          });
        }
      },
    });
  };

  const handleMultiwaySwitch = (key, value) => {
    const result = [] as any;
    productConfig.controlSchema[current].forEach(schemaKey => {
      if (schemaChanelMap[schemaKey]) {
        if (schemaKey === key) {
          result.push(schemaChanelMap[schemaKey] + (value ? '01' : '00'));
        } else {
          result.push(
            schemaChanelMap[schemaKey] + (controlItemSwitchGetter(schemaKey) ? '01' : '00')
          );
        }
      }
    });
    const putData = result.sort().join('');

    changeWorkMode();
    TYSdk.device.putDeviceData({
      multiway_switch: putData,
    });
  };

  /**
   * Renders
   */
  const renderSwitch = () => {
    const switchText = Strings.getLang('on') + '/' + Strings.getLang('off');
    return (
      <View style={[commonStyles.card, commonStyles.line]}>
        <TYText
          style={{
            fontSize: 18,
            marginBottom: cx(8),
            color: color.text,
          }}
          text={switchText}
        />
        <SwitchButton
          size={{
            activeSize: 34,
            margin: 3,
            width: 78,
            height: 40,
            borderRadius: 16,
          }}
          theme={{ onTintColor: '#57BCFB', onThumbTintColor: '#FFF' }}
          thumbStyle={{ width: 34, height: 34, borderRadius: 14 }}
          switchType="thumbMore"
          value={dpState.switch_led}
          onValueChange={v => changeWorkMode() && TYSdk.device.putDeviceData({ switch_led: v })}
          tintColor="#E5E5E5"
        />
      </View>
    );
  };

  const renderRecommend = recommendConfig => {
    if (recommendConfig && recommendConfig.list && recommendConfig.list.length > 0) {
      return (
        <View style={commonStyles.card}>
          <TYText
            style={{
              fontSize: 18,
              marginBottom: cx(8),
              color: color.text,
            }}
            // text={Strings.getLang('recommend_light')}
            text={recommendConfig.title}
          />
          <View style={styles.buttonList}>
            {recommendConfig.list.map(item => (
              <Button
                textStyle={styles.buttonItemText}
                style={styles.buttonItem}
                text={item.text}
                onPress={() => handleRecommendPress(item)}
              ></Button>
            ))}
          </View>
        </View>
      );
    } else {
      return null;
    }
  };

  const renderRecommendItems = () => {
    const renderComponent = productConfig.recommend[current].map(item => renderRecommend(item));
    return (
      <View>
        {renderComponent}
        <View style={commonStyles.card}>
          <TYText
            style={{
              fontSize: 18,
              marginBottom: cx(8),
              color: color.text,
            }}
            // text={Strings.getLang('recommend_light')}
            text={'光谱参考'}
          />
          <Image style={styles.banner} source={recommendSource} />
        </View>
      </View>
    );
  };

  const renderControl = () => {
    return (
      <View style={commonStyles.card}>
        <TYText
          style={{
            marginBottom: 12,
          }}
          text={Strings.getLang('custom_bright')}
          size={18}
        />
        {renderControlItems}
      </View>
    );
  };

  const renderControlItems = productConfig.controlSchema[current].map(key => {
    const isShowButton = switchSchema[current].includes(key);
    const isShowSlider = !isShowButton || controlItemSwitchGetter(key);
    const renderSwitchButton = () => {
      if (isShowButton) {
        return (
          <SwitchButton
            value={controlItemSwitchGetter(key)}
            size={{
              activeSize: 18,
              margin: 5,
              width: 52,
              height: 28,
              borderRadius: 10,
            }}
            theme={{ onTintColor: '#57BCFB', onThumbTintColor: '#FFF' }}
            thumbStyle={{ width: 18, height: 18, borderRadius: 6 }}
            onText="ON"
            offText="OFF"
            onValueChange={v => handleMultiwaySwitch(key, v)}
          />
        );
      } else {
        return null;
      }
    };
    const renderSlider = () => {
      if (isShowSlider) {
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
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
              minimumValue={1}
              style={{ width: cx(180), height: cx(36) }}
              value={controlItemValueGetter(key)}
              onSlidingComplete={v => handleControlValueChange(key, v)}
            />
            <Stepper
              style={{
                width: cx(92),
              }}
              max={100}
              min={1}
              buttonStyle={styles.stepButtonStyle}
              inputStyle={styles.stepInputStyle}
              editable={true}
              value={controlItemValueGetter(key)}
              onValueChange={v => handleControlValueChange(key, v)}
            />
          </View>
        );
      } else {
        return null;
      }
    };
    return (
      <View>
        <Divider style={{ marginVertical: 12 }}></Divider>
        <View
          style={{
            height: 40,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TYText style={{ width: cx(96) }} text={controlItemLabelGetter(key)} size={18} />
          {renderSwitchButton()}
        </View>
        {renderSlider()}
      </View>
    );
  });

  // const renderOperation = () => {
  //   return (
  //     <View style={[commonStyles.card, commonStyles.line]}>
  //       <SwitchButton
  //         size={{
  //           activeSize: 34,
  //           margin: 3,
  //           width: 78,
  //           height: 40,
  //           borderRadius: 16,
  //         }}
  //         theme={{ onTintColor: '#57BCFB', onThumbTintColor: '#FFF' }}
  //         thumbStyle={{ width: 34, height: 34, borderRadius: 14 }}
  //         switchType="thumbMore"
  //         value={dpState.switch_led}
  //         onValueChange={v => TYSdk.device.putDeviceData({ switch_led: v })}
  //         tintColor="#E5E5E5"
  //       />
  //       <Button
  //         style={[commonStyles.button, { width: cx(120) }]}
  //         textStyle={commonStyles.buttonText}
  //         text={Strings.getLang('more')}
  //         onPress={handlePressMore}
  //       ></Button>
  //     </View>
  //   );
  // };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {renderSwitch()}
        {renderRecommendItems()}
        {/* {renderRecommend()} */}
        {renderControl()}
        {/* {renderOperation()} */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: color.young,
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
    height: cx(160),
    marginVertical: cx(16),
  },
  /**
   * Control
   */
  stepButtonStyle: {
    width: cx(28),
  },
  stepInputStyle: {
    width: cx(36),
  },
  /**
   * Switch
   */
  switch: {
    alignSelf: 'flex-end',
    paddingHorizontal: cx(16),
    // marginBottom: cx(36),
  },
});

export default Layout;
