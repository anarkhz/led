import React, { useEffect } from 'react';
import { StatusBar, AsyncStorage } from 'react-native';
import { Dispatch } from 'redux';
import {
  TYSdk,
  NavigatorLayout,
  NavigationOptions,
  DeprecatedNavigator,
  DeprecatedNavigatorRoute,
} from 'tuya-panel-kit';
import composeLayout from './composeLayout';
import { store, ReduxState, actions } from './models';

import SwitchProduct from './pages/switch-product';
import SwitchGradient from './pages/switch-gradient';
import LightSetting from './pages/light-setting';
import Scene from './pages/scene';
import Timer from './pages/timer';
import TimerAdd from './pages/timer/timerAdd';

console.disableYellowBox = true;

type Props = ReduxState & { dispatch: Dispatch };

// 慎用，生成环境上不要开启，console 打印层次过深会导致性能问题
// if (__DEV__) {
//   console.log('TYSdk :', TYSdk);
// }

const routers = [
  {
    id: 'main',
    title: '灯光设置',
    hideFooter: false,
    component: props => <LightSetting {...props} />,
  },
  {
    id: 'switch-product',
    title: '选择产品',
    component: props => <SwitchProduct {...props} />,
  },
  {
    id: 'switch-gradient',
    title: '灯光渐变',
    component: props => <SwitchGradient {...props} />,
  },
  {
    id: 'scene',
    title: '我的场景',
    component: props => <Scene {...props} />,
  },
  {
    id: 'timer',
    title: '定时设置',
    component: props => <Timer {...props} />,
  },
  {
    id: 'timer-add',
    title: '添加定时',
    component: props => <TimerAdd {...props} />,
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
    const currentRoute = routers.find(r => r.id === route.id);

    return {
      ...route,
      title: currentRoute?.title,
      renderStatusBar: () => <StatusBar barStyle="default" />,
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
