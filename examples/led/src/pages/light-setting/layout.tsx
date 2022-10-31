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

const { channelSchemaMap, schemaChanelMap } = productConfig.maps;

const { convertX: cx, width: deviceWidth, height: deviceHeight } = Utils.RatioUtils;

const Layout: React.FC = () => {
  const dpState = useSelector(state => state.dpState);
  const devInfo = useSelector(state => state.devInfo);
  const current = useSelector(state => state.product.current);
  const dispatch = useDispatch();
  const [recommendSource, setRecommendSource] = React.useState(Res.cat);

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
    TYSdk.device.putDeviceData(item.setting);
    setRecommendSource(item.img);
  };

  const handleControlValueChange = _.debounce((key, value) => {
    TYSdk.device.putDeviceData({ [key]: Math.round(value) * 10 });
    setRecommendSource(Res.cat);
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

    TYSdk.device.putDeviceData({
      multiway_switch: putData,
    });
  };

  /**
   * Renders
   */
  const renderRecommend = () => {
    if (productConfig.recommend[current] && productConfig.recommend[current].length > 0) {
      return (
        <View>
          <View style={commonStyles.card}>
            <TYText
              style={{
                fontSize: 18,
                marginBottom: cx(8),
                color: color.text,
              }}
              text={Strings.getLang('recommend_light')}
            />
            <View style={styles.buttonList}>
              {productConfig.recommend[current].map(item => (
                <Button
                  textStyle={styles.buttonItemText}
                  style={styles.buttonItem}
                  text={item.text}
                  onPress={() => handleRecommendPress(item)}
                ></Button>
              ))}
            </View>
          </View>
          <View style={[commonStyles.card, { padding: 0 }]}>
            <Image style={styles.banner} source={recommendSource} />
          </View>
        </View>
      );
    } else {
      return null;
    }
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
        {productConfig.controlSchema[current].map(key => (
          <View>
            <Divider style={{ marginVertical: 12 }}></Divider>
            <View
              style={{
                height: 40,
                // marginTop: 12,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <TYText style={{ width: cx(96) }} text={controlItemLabelGetter(key)} size={18} />
              <SwitchButton
                style={{
                  display: key === 'all_bright' ? 'none' : 'flex',
                }}
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
            </View>
            <View
              style={{
                display: key === 'all_bright' || controlItemSwitchGetter(key) ? 'flex' : 'none',
                // marginBottom: 12,
                // display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* <TYText style={{ width: cx(96) }} text={controlItemLabelGetter(key)} size={18} /> */}
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
          </View>
        ))}
      </View>
    );
  };

  const renderOperation = () => {
    return (
      <View style={[commonStyles.card, commonStyles.line]}>
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
          onValueChange={v => TYSdk.device.putDeviceData({ switch_led: v })}
          tintColor="#E5E5E5"
        />
        <Button
          style={[commonStyles.button, { width: cx(120) }]}
          textStyle={commonStyles.buttonText}
          text={Strings.getLang('more')}
          onPress={handlePressMore}
        ></Button>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {renderRecommend()}
        {renderControl()}
        {renderOperation()}
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
    // borderWidth: cx(1),
    backgroundColor: color.young,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.5,
    // shadowRadius: 8,
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
    width: cx(24),
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
