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
import React, { useRef } from 'react';

import { useDispatch } from 'react-redux';
import { useSelector, actions } from '@models';

import LightSettingModal from '@components/lightSettingModal';

const {
  convertX: cx,
  width: deviceWidth,
  height: deviceHeight,
  viewWidth,
  viewHeight,
} = Utils.RatioUtils;

const addIconPath =
  'M558.545455 240.48484804v217.212122h217.212121v93.090909H558.529939L558.545455 768.00000004h-93.09091l-0.015515-217.212121H248.242424v-93.090909h217.212121V240.48484804z';

const Layout: React.FC = props => {
  const product = useSelector(state => state.product);
  const dispatch = useDispatch();

  const cRef = useRef(null);

  const [editIndex, setEditIndex] = React.useState(0);

  function handleAddScene() {
    cRef.current.open({
      type: 'add-scene',
    });
  }

  function handleEditScene(item, index) {
    setEditIndex(index);
    cRef.current.open({
      type: 'edit-scene',
      name: item.name,
      setting: item.setting,
    });
  }

  function handleModalConfirm({ type, name, setting }) {
    if (type === 'add-scene') {
      dispatch(
        actions.product.addScene({
          name,
          setting,
        })
      );
    } else if (type === 'edit-scene') {
      dispatch(
        actions.product.changeScene({
          index: editIndex,
          name,
          setting,
        })
      );
    }
  }

  const AddSceneButton: React.FC = () => {
    return (
      <Button
        iconColor="#fff"
        size={24}
        style={{
          position: 'absolute',
          bottom: cx(32),
          left: deviceWidth - cx(60),
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
          alignSelf: 'flex-start',
        }}
        iconPath={addIconPath}
        onPress={handleAddScene}
      />
    );
  };

  const SceneItems: React.FC = () => {
    const getSceneList = () => {
      const current = product.current;
      if (current) {
        return product[`${current}_scene`];
      } else {
        return [];
      }
    };

    const handleScenePress = (item, index) => {
      Popup.list({
        type: 'radio',
        // maxItemNum: 7,
        dataSource: [
          {
            key: '0',
            title: '应用场景',
            value: 'use',
          },
          {
            key: '1',
            title: '编辑场景',
            value: 'edit',
          },
          {
            key: '2',
            title: '删除场景',
            value: 'delete',
          },
        ],
        title: '请选择',
        // subTitle: '副标题',
        cancelText: '取消',
        // value: '',
        selectedIcon: <View></View>,
        footerType: 'singleCancel',
        onMaskPress: ({ close }) => close(),
        onSelect: (value, { close: popupClose }) => {
          if (value === 'use') {
            TYSdk.device.putDeviceData(item.setting);
            popupClose();
            TYSdk.Navigator.push({
              id: 'main',
            });
          } else if (value === 'edit') {
            popupClose();
            setTimeout(() => {
              handleEditScene(item, index);
            }, 500);
            // dispatch(actions.product.changeFooterVisible(false));
            // TYSdk.Navigator.push({
            //   id: 'scene-edit',
            //   index,
            // });
          } else if (value === 'delete') {
            // close();
            // setTimeout(() => {
            Dialog.confirm({
              title: '确定要删除吗',
              // subTitle: '副标题',
              cancelText: '取消',
              confirmText: '确认',
              onConfirm: (data, { close: confirmClose }) => {
                dispatch(actions.product.deleteScene({ index }));
                confirmClose();
                popupClose();
              },
            });
            // }, 500);
          }
          // setState({ listValue: value });
          // close();
        },
      });
    };

    const renderSceneItems = items =>
      items.map((item, index) => (
        <Button
          textStyle={styles.sceneItemText}
          style={styles.sceneItem}
          text={item.name}
          onPress={() => handleScenePress(item, index)}
        ></Button>
      ));

    return (
      <View style={styles.sceneItems}>
        {renderSceneItems(getSceneList())}
        <Button style={styles.scenePlaceItems} />
        <Button style={styles.scenePlaceItems} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <SceneItems />
      </ScrollView>
      <AddSceneButton />
      <LightSettingModal
        ref={cRef}
        // onCancel={() => setModalVisible(false)}
        onConfirm={setting => handleModalConfirm(setting)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  /* Scene Items */
  sceneItems: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: cx(12),
    paddingTop: cx(6),
    paddingBottom: cx(80),
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
});

export default Layout;
