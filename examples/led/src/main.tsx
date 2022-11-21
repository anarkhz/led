import React, { useEffect } from 'react';
import { StatusBar, AsyncStorage } from 'react-native';
import { Dispatch } from 'redux';
import {
  TYSdk,
  NavigatorLayout,
  NavigationOptions,
  DeprecatedNavigator,
  DeprecatedNavigatorRoute,
  TopBar,
} from 'tuya-panel-kit';
import composeLayout from './composeLayout';
import { store, ReduxState, actions } from './models';

import SwitchProduct from './pages/switch-product';
import SwitchGradient from './pages/switch-gradient';
import LightSetting from './pages/light-setting';
import Scene from './pages/scene';
import Timer from './pages/timer';
import TimerAdd from './pages/timer/timerAdd';
import TimerEdit from './pages/timer/timerEdit';

console.disableYellowBox = true;

type Props = ReduxState & { dispatch: Dispatch };

// 慎用，生成环境上不要开启，console 打印层次过深会导致性能问题
// if (__DEV__) {
//   console.log('TYSdk :', TYSdk);
// }

const topBarRenderer = (isPop = false) => (
  <TopBar
    style={{ height: 48 }}
    contentStyle={{ height: 48, marginTop: 0 }}
    background="#fff"
    title={'头部栏'}
    color="red"
    titleStyle={{
      color: '#4C4C4C',
    }}
    leftActions={[
      {
        name: 'backIos',
        color: '#4C4C4C',
        onPress: () => (isPop ? TYSdk.Navigator.pop() : TYSdk.mobile.back()),
      },
    ]}
    actions={[
      {
        name: 'pen',
        color: '#4C4C4C',
        onPress: () => TYSdk.native.showDeviceMenu(),
      },
    ]}
  />
);

const routers = [
  {
    id: 'main',
    title: '灯光设置',
    component: props => <LightSetting {...props} />,
    topBar: topBarRenderer(),
  },
  {
    id: 'switch-product',
    title: '选择产品',
    component: props => <SwitchProduct {...props} />,
    topBar: topBarRenderer(),
  },
  {
    id: 'switch-gradient',
    title: '灯光渐变',
    component: props => <SwitchGradient {...props} />,
    topBar: topBarRenderer(),
  },
  {
    id: 'scene',
    title: '我的场景',
    component: props => <Scene {...props} />,
    topBar: topBarRenderer(),
  },
  {
    id: 'timer',
    title: '定时设置',
    component: props => <Timer {...props} />,
    topBar: topBarRenderer(),
  },
  {
    id: 'timer-add',
    title: '添加定时',
    component: props => <TimerAdd {...props} />,
    topBar: topBarRenderer(true),
  },
  {
    id: 'timer-edit',
    title: '编辑定时',
    component: props => <TimerEdit {...props} />,
    topBar: topBarRenderer(true),
  },
  // {
  //   id: 'home',
  //   title: 'home',
  //   component: props => <Home {...props} />,
  // },
];

class MainLayout extends NavigatorLayout<Props> {
  /**
   *
   * @desc hookRoute 可以在这里针对特定路由做一些控制处理，
   * 具体可控制的参数可参考 NavigationOptions 类型描述
   */
  hookRoute(route: DeprecatedNavigatorRoute): NavigationOptions {
    if (route.initialRoute) {
      const { dpState } = store.getState();
      if (dpState.work_mode === 'white') {
        route.id = 'main';
      } else if (dpState.work_mode === 'scene') {
        route.id = 'scene';
      }
    }

    const currentRoute = routers.find(r => r.id === route.id);

    return {
      ...route,
      title: currentRoute?.title,
      renderTopBar: () => currentRoute?.topBar,
    };
  }

  /**
   * @desc
   * 在此您可以通过 route 中的 ID 来判断使用哪个页面组件
   * 如果有额外的 props 需要传递给页面组件的，可以在此进行传递
   * 注意：route 参数来自于 TYSdk.Navigator.push，
   * 如果调用了 TYSdk.Navigator.push({ id: 'setting', title: 'Setting Page' });
   * 则会在推入路由栈时 hookRoute 和 renderScene 这个周期里会接受到 route = { id: 'setting', title: 'Setting Page' }，
   * 但要注意的是，首页的 route 参数是固定的，为 { 'id': 'main', 'initialRoute': true }
   *
   * @param {Object} route - route对象
   * @param {object} navigator - Navigator对象，具体使用方法可参考https://facebook.github.io/react-native/docs/0.43/navigator.html
   */
  renderScene(route: DeprecatedNavigatorRoute, navigator: DeprecatedNavigator) {
    const currentRoute = routers.find(r => r.id === route.id);

    let Scene;

    if (currentRoute && currentRoute.component) {
      const Component = currentRoute.component;
      Scene = <Component navigator={navigator} {...route} />;
    }

    return Scene;
  }
}

export default composeLayout(store, MainLayout);
