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

import { icon } from '@config';

import LightSettingModal from '@components/lightSettingModal';

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
        } else if (value === 'delete') {
          Dialog.confirm({
            title: '确定要删除吗',
            cancelText: '取消',
            confirmText: '确认',
            onConfirm: (data, { close: confirmClose }) => {
              dispatch(actions.product.deleteScene({ index }));
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

  /**
   * Renders
   */
  const renderSceneItems = () => {
    if (scene && scene[current] && scene[current].length > 0) {
      return (
        <View style={styles.sceneItems}>
          {scene[current].map((item, index) => {
            return (
              <Button
                textStyle={styles.sceneItemText}
                style={styles.sceneItem}
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

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>{renderSceneItems()}</ScrollView>
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
