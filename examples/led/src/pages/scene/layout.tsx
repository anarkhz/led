import { StyleSheet, View, Image, ScrollView } from 'react-native';
import {
  TYSdk,
  Utils,
  Button,
  Popup,
  Dialog,
  TYText,
  Slider,
  Stepper,
  SwitchButton,
} from 'tuya-panel-kit';
import React, { useRef, useEffect } from 'react';

import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';

import { color, icon, productConfig } from '@config';

import LightSettingModal from '@components/lightSettingModal';
import Strings from '@i18n';
import { putSetScene, getSceneId } from './helper';

const {
  convertX: cx,
  width: deviceWidth,
  height: deviceHeight,
  viewWidth,
  viewHeight,
} = Utils.RatioUtils;

const Layout: React.FC = props => {
  const dpState = useSelector(state => state.dpState);
  const devInfo = useSelector(state => state.devInfo);
  const product = useSelector(state => state.product);
  const { scene, current } = product;
  const dispatch = useDispatch();
  const cRef = useRef(null);
  const [editIndex, setEditIndex] = React.useState(0);

  const [activeId, setActiveId] = React.useState(-1);

  setTimeout(() => {
    if (activeId === -1) {
      if (dpState.plant_scene_data) {
        const id = parseInt(dpState.plant_scene_data.substr(0, 2), 16);
        setCurrentScene(id);
      }
      // 不设置兜底
      // else {
      //   setCurrentScene(0);
      // }
    }
  }, 0);

  function changeWorkMode() {
    if (dpState.work_mode !== 'scene') {
      TYSdk.device.putDeviceData({
        work_mode: 'scene',
      });
    }
  }

  /**
   * Handlers
   */
  const handleScenePress = (item, index) => {
    Popup.list({
      type: 'radio',
      // maxItemNum: 7,
      dataSource: [
        {
          key: '0',
          title: Strings.getLang('execute_scene'),
          value: 'use',
        },
        {
          key: '1',
          title: Strings.getLang('edit_scene'),
          value: 'edit',
        },
        {
          key: '2',
          title: Strings.getLang('del_scene'),
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
        if (value === 'use') {
          popupClose();
          changeWorkMode();
          setCurrentScene(item.id);
        } else if (value === 'edit') {
          popupClose();
          setTimeout(() => {
            handleEditScene(item, index);
          }, 500);
        } else if (value === 'delete') {
          Dialog.confirm({
            title: Strings.getLang('del_scene_question'),
            cancelText: Strings.getLang('cancel'),
            confirmText: Strings.getLang('confirm'),
            onConfirm: (data, { close: confirmClose }) => {
              const deleteItem = scene[current][index];
              dispatch(actions.product.deleteScene({ index }));
              if (deleteItem.id === activeId) {
                setCurrentScene(0);
              }
              confirmClose();
              popupClose();
            },
          });
        }
      },
    });
  };

  const handleAddScene = () => {
    cRef.current &&
      cRef.current.open({
        type: 'add-scene',
      });
  };

  function handleEditScene(item, index) {
    setEditIndex(index);
    cRef.current &&
      cRef.current.open({
        type: 'edit-scene',
        name: item.name,
        setting: item.setting,
        multiwaySwitch: item.multiwaySwitch,
      });
  }

  function handleModalConfirm({ type, name, setting, multiwaySwitch }) {
    if (type === 'add-scene') {
      dispatch(
        actions.product.addScene({
          name,
          setting,
          multiwaySwitch,
          id: getSceneId(scene, current),
        })
      );
    } else if (type === 'edit-scene') {
      dispatch(
        actions.product.changeScene({
          index: editIndex,
          name,
          setting,
          multiwaySwitch,
        })
      );
    }
  }

  function handleSwitchScene(switchValue, sceneItem) {
    if (switchValue) {
      setCurrentScene(sceneItem.id);
    } else {
      setCurrentScene(0);
    }
  }

  const setCurrentScene = id => {
    if (id === 0 || id === 1 || id === 2) {
      TYSdk.device.putDeviceData({
        plant_scene_data: '0' + id,
      });
      setActiveId(id);
    } else {
      const items = scene[current]?.filter(s => s.id === id);
      if (items && items.length > 0) {
        putSetScene(items[0]);
        setActiveId(id);
      }
      // 取消默认设置
      else {
        TYSdk.device.putDeviceData({
          plant_scene_data: '00',
        });
        setActiveId(0);
      }
    }
  };

  /**
   * Renders
   */
  // const renderRecommendSceneItems = () => {
  //   const items = [
  //     {
  //       name: '幼苗期',
  //       value: '00',
  //       id: 0,
  //     },
  //     {
  //       name: '成长期',
  //       value: '01',
  //       id: 1,
  //     },
  //     {
  //       name: '开花期',
  //       value: '02',
  //       id: 2,
  //     },
  //   ];
  //   return (
  //     <View style={styles.sceneItems}>
  //       {items.map((item, index) => {
  //         return (
  //           <Button
  //             textStyle={styles.sceneItemText}
  //             style={{
  //               ...styles.sceneItem,
  //               backgroundColor: activeId === item.id ? color.dark : '#409eff',
  //             }}
  //             text={item.name}
  //             onPress={() => setCurrentScene(item.id)}
  //           ></Button>
  //         );
  //       })}
  //       <Button style={styles.scenePlaceItems} />
  //       <Button style={styles.scenePlaceItems} />
  //     </View>
  //   );
  // };

  const renderSceneItems = () => {
    if (scene && scene[current] && scene[current].length > 0) {
      return (
        <View style={styles.sceneItems}>
          {scene[current].map((item, index) => {
            return (
              <Button
                textStyle={styles.sceneItemText}
                style={{
                  ...styles.sceneItem,
                  backgroundColor: activeId === item.id ? color.dark : '#409eff',
                }}
                text={item.name}
                onPress={() => handleScenePress(item, index)}
              ></Button>
            );
          })}
          <Button style={styles.scenePlaceItems} />
          <Button style={styles.scenePlaceItems} />
        </View>
      );
    } else {
      return null;
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
          size={24}
          style={{
            width: cx(48),
            height: cx(48),
          }}
          wrapperStyle={{
            alignSelf: 'flex-start',
          }}
          iconPath={icon.path.plus}
          onPress={handleAddScene}
        />
      </View>
    );
  };

  const renderSceneItems1 = () => {
    if (scene && scene[current] && scene[current].length > 0) {
      return (
        <View style={styles.sceneItems}>
          {scene[current].map((item, index) => {
            return (
              <View style={styles.sceneItemWrap}>
                <Button
                  textStyle={styles.sceneItemText}
                  style={styles.sceneItem}
                  text={item.name}
                  onPress={() => handleScenePress(item, index)}
                ></Button>
                <SwitchButton
                  value={activeId === item.id}
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
                  onValueChange={v => handleSwitchScene(v, item)}
                />
              </View>
            );
          })}
        </View>
      );
    } else {
      return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {/* <TYText style={styles.title} text="推荐" />
        {renderRecommendSceneItems()} */}
        {/* <TYText
          style={{
            ...styles.title,
            display: scene && scene[current] && scene[current].length > 0 ? 'flex' : 'none',
          }}
          text="自定义场景"
        /> */}
        {/* {renderSceneItems()} */}
        {renderSceneItems1()}
      </ScrollView>
      {renderAddButton()}
      <LightSettingModal
        ref={cRef}
        // onCancel={() => setModalVisible(false)}
        onConfirm={options => handleModalConfirm(options)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: cx(16),
    color: color.text,
  },
  /* Scene Items */
  // sceneItems: {
  //   display: 'flex',
  //   flexDirection: 'row',
  //   flexWrap: 'wrap',
  //   paddingHorizontal: cx(12),
  //   paddingTop: cx(6),
  //   paddingBottom: cx(80),
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   shadowColor: '#000',
  //   shadowOffset: {
  //     width: 0,
  //     height: 1,
  //   },
  //   shadowOpacity: 0.5,
  //   shadowRadius: 8,
  // },
  // sceneItem: {
  //   width: cx(100),
  //   height: cx(100),
  //   backgroundColor: '#409eff',
  //   borderRadius: cx(4),
  //   margin: cx(8),
  // },
  // 占位调整布局用，无实际意义
  scenePlaceItems: {
    width: cx(100),
    height: 0,
    margin: cx(8),
  },
  sceneItemText: {
    fontSize: cx(18),
    color: '#fff',
  },
  /* New Scene Items */
  sceneItems: {
    paddingTop: cx(6),
    paddingBottom: cx(80),
  },
  sceneItemWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: cx(12),
    // flexWrap: 'wrap',
    // paddingTop: cx(6),
    // paddingBottom: cx(80),
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.5,
    // shadowRadius: 8,
  },
  sceneItem: {
    width: cx(200),
    height: cx(80),
    backgroundColor: '#409eff',
    borderRadius: cx(4),
    margin: cx(8),
  },
});

export default Layout;
