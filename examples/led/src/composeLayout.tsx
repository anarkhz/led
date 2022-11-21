import _ from 'lodash';
import { Store } from 'redux';
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { View, AsyncStorage, StatusBar } from 'react-native';
import { TYSdk, Theme, DevInfo, DpValue, ControllerBar } from 'tuya-panel-kit';
import { Connect } from '@components';
import { actions, useSelector } from '@models';
import { theme, color, icon } from '@config';

interface Props {
  devInfo: DevInfo;
  preload?: boolean;
}

const TYEvent = TYSdk.event;
const TYDevice = TYSdk.device;

/**
 *
 * @param {Object} store - redux store
 * @param {ReactComponent} component - 需要连接到redux store的组件，通常为即为main
 */
const composeLayout = (store: Store, component: React.ComponentType) => {
  const NavigatorLayout = component;
  const { dispatch } = store;

  // const [storagePrepared, setStoragePrepared] = React.useState(false);

  /**
   * 此处监听了`设备数据变更`事件，
   * 每当dp点数据变更时，会将变更的dp点状态同步更新到`redux`中去。
   * 同理当设备信息变更时，也会将变更的设备信息值同步更新到`redux`中去。
   */
  TYEvent.on('deviceDataChange', data => {
    switch (data.type) {
      case 'dpData':
        dispatch(actions.common.responseUpdateDp(data.payload as Record<string, DpValue>));
        break;
      default:
        dispatch(actions.common.deviceChange(data.payload as DevInfo));
        break;
    }
  });

  /**
   * 此处监听了`网络状态变更事件`事件，
   * 每当设备信息变更时，会将变更的设备信息值同步更新到`redux`中去。
   */
  TYSdk.event.on('networkStateChange', data => {
    dispatch(actions.common.deviceChange(data as any));
  });

  class PanelComponent extends Component<Props> {
    /**
     * 如果面板进入时，`devInfo`已经存在(通常都会存在的)
     * 这里会调用 setDeviceInfo 将原始的devInfo处理一下，并置入`redux`
     *
     * 如果面板进入时，`devInfo`不存在，
     * 那么会调用 getDeviceInfo 异步获取处理好的`devInfo`，并置入`redux`
     */
    constructor(props: Props) {
      super(props);

      this.state = {
        storagePrepared: false,
      };

      if (props && props.devInfo && props.devInfo.devId) {
        TYDevice.setDeviceInfo(props.devInfo);
        TYDevice.getDeviceInfo()
          .then(data => {
            dispatch(actions.common.devInfoChange(data));
            return Promise.all([TYDevice.getDeviceState(), data]);
          })
          .then(([dpState, devInfo]) => {
            const isEqual = _.isEqual(dpState, devInfo.state);
            if (isEqual) return;
            dispatch(actions.common.responseUpdateDp(dpState));
          });
      } else if (props.preload) {
        // do something
      } else {
        TYDevice.getDeviceInfo().then(data => dispatch(actions.common.devInfoChange(data)));
      }

      // setTimeout(() => {
      //   this.setState({ storagePrepared: true });
      // }, 0);

      // FIXME: 注入初始状态
      const initLocal = async () => {
        const getCurrentPromise = AsyncStorage.getItem('current');
        const getScenePromise = AsyncStorage.getItem('scene');
        const getTimerPromise = AsyncStorage.getItem('timer');
        Promise.all([getCurrentPromise, getScenePromise, getTimerPromise])
          .then(result => {
            const [current, scene, timer] = result;
            if (current) {
              dispatch(actions.product.changeCurrent(current));
            } else {
              dispatch(actions.product.changeCurrent('RB'));
              setTimeout(() => {
                TYSdk.Navigator.replace({
                  id: 'switch-product',
                });
              }, 0);
            }

            if (scene) {
              dispatch(
                actions.product.initScene({
                  scene: JSON.parse(scene),
                })
              );
            }
            if (timer) {
              dispatch(
                actions.product.initTimer({
                  timer: JSON.parse(timer),
                })
              );
            }
            this.setState({ storagePrepared: true });
          })
          .catch(() => {
            this.setState({ storagePrepared: true });
          });
      };

      initLocal();
    }

    render() {
      return (
        <Provider store={store}>
          <Theme theme={theme}>
            <Connect mapStateToProps={_.identity}>
              {({ mapStateToProps, ...props }: { mapStateToProps: any; [prop: string]: any }) => {
                const hasInit = Object.keys(props.dpState).length > 0;
                // return hasInit ? <NavigatorLayout {...props} /> : null;
                if (hasInit && this.state.storagePrepared) {
                  return (
                    <View style={{ flex: 1 }}>
                      <NavigatorLayout {...props} />
                      <ControllerBar
                        style={{
                          backgroundColor: '#FFF',
                          display: props.product.showFooter ? 'flex' : 'none',
                        }}
                        size={44}
                        button={[
                          // {
                          //   size: 40,
                          //   icon: 'selected',
                          //   iconSize: 24,
                          //   iconColor: '#fff',
                          //   type: 'primary',
                          //   text: '产品',
                          //   onPress: () =>
                          //     TYSdk.Navigator.push({
                          //       id: 'switch-product',
                          //       title: 'switch product',
                          //     }),
                          // },
                          {
                            size: 40,
                            iconPath: icon.path.light,
                            iconSize: 32,
                            iconColor: color.primary,
                            // type: 'primary',
                            // text: '灯光',
                            onPress: () => {
                              TYSdk.Navigator.replace({
                                id: 'main',
                                title: 'light setting',
                                // renderStatusBar: () => <StatusBar barStyle="default" />,
                              });
                              TYSdk.device.putDeviceData({
                                work_mode: 'white',
                              });
                            },
                          },
                          {
                            size: 40,
                            iconPath: icon.path.change,
                            iconSize: 32,
                            iconColor: color.primary,
                            // type: 'primary',
                            // text: '渐变',
                            onPress: () =>
                              TYSdk.Navigator.replace({
                                id: 'switch-gradient',
                                title: 'switch gradient',

                                // renderStatusBar: () => <StatusBar barStyle="default" />,
                              }),
                          },
                          {
                            size: 40,
                            iconPath: icon.path.scene,
                            iconSize: 32,
                            iconColor: color.primary,
                            // text: '场景',
                            onPress: () => {
                              TYSdk.Navigator.replace({
                                id: 'scene',
                                title: 'scene',

                                // renderStatusBar: () => <StatusBar barStyle="default" />,
                              });
                              TYSdk.device.putDeviceData({
                                work_mode: 'scene',
                              });
                            },
                          },
                          {
                            size: 40,
                            iconPath: icon.path.timer,
                            iconSize: 32,
                            iconColor: color.primary,
                            // text: '定时',
                            onPress: () =>
                              TYSdk.Navigator.replace({
                                id: 'timer',
                                title: 'timer',

                                // renderStatusBar: () => <StatusBar barStyle="default" />,
                              }),
                          },
                        ]}
                      />
                    </View>
                  );
                } else {
                  return null;
                }
              }}
            </Connect>
          </Theme>
        </Provider>
      );
    }
  }

  return PanelComponent;
};

export default composeLayout;
