import { AsyncStorage } from 'react-native';
import { TYSdk } from 'tuya-panel-kit';

const productState = {
  showFooter: true,
  current: '',
  RB_gradientTime: 20,
  RB_lightSetting: {
    R: 0,
    B: 0,
    brightness: 0,
  },
  RB_switch: false,
  RB_scene: [],
  RB_timer: [
    // {
    //   startTime: 120,
    //   endTime: 240,
    //   running: false,
    //   loopDays: [1, 2, 3, 4, 5, 6],
    //   setting: {},
    // },
    // {
    //   startTime: 240,
    //   endTime: 480,
    //   running: true,
    //   loopDays: [],
    //   setting: {},
    // },
    // {
    //   startTime: 666,
    //   endTime: 888,
    //   running: false,
    //   loopDays: [1, 2, 3, 4, 5, 6, 7],
    //   setting: {},
    // },
  ],
};

export const actions = {
  changeFooterVisible(visible: boolean) {
    return {
      type: 'CHANGE_FOOTER_VISIBLE',
      visible,
    };
  },
  changeCurrent(current: string) {
    return {
      type: 'CHANGE_CURRENT',
      current,
    };
  },
  changeGradientTime(time: number | string) {
    return {
      type: 'CHANGE_GRADIENT_TIME',
      time,
    };
  },
  changeLightSetting(setting) {
    return {
      type: 'CHANGE_LIGHT_SETTING',
      setting,
    };
  },
  changeSwitch(value: Boolean) {
    return {
      type: 'CHANGE_SWITCH',
      value,
    };
  },
  initScene({ scene }) {
    return {
      type: 'INIT_SCENE',
      scene,
    };
  },
  addScene({ name, setting }) {
    return {
      type: 'ADD_SCENE',
      name,
      setting,
    };
  },
  changeScene({ index, name, setting }) {
    return {
      type: 'CHANGE_SCENE',
      index,
      name,
      setting,
    };
  },
  deleteScene({ index }) {
    return {
      type: 'DELETE_SCENE',
      index,
    };
  },
  initTimer({ timer }) {
    return {
      type: 'INIT_TIMER',
      timer,
    };
  },
  addTimer({ timer }) {
    return {
      type: 'ADD_TIMER',
      timer,
    };
  },
  changeTimer({ index, timer }) {
    return {
      type: 'CHANGE_TIMER',
      index,
      timer,
    };
  },
};

export const reducers = {
  product(state = productState, action) {
    console.log(JSON.stringify(state));
    switch (action.type) {
      case 'CHANGE_FOOTER_VISIBLE': {
        return {
          ...state,
          showFooter: action.visible,
        };
      }
      case 'CHANGE_CURRENT': {
        const current = action.current;
        AsyncStorage.setItem('current', current);
        return {
          ...state,
          current,
        };
      }
      case 'CHANGE_GRADIENT_TIME': {
        const time = action.time;
        const current = state.current;

        AsyncStorage.setItem(`${current}_gradientTime`, time);
        return {
          ...state,
          ...{
            [current + '_gradientTime']: time,
          },
        };
      }
      case 'CHANGE_LIGHT_SETTING': {
        const { setting } = action;
        const current = state.current;

        const lightSetting = state[current + '_lightSetting'] || {};

        const newLightSetting = {
          ...lightSetting,
          ...setting,
        };

        AsyncStorage.setItem(`${current}_lightSetting`, JSON.stringify(newLightSetting));

        return {
          ...state,
          ...{
            [current + '_lightSetting']: {
              ...newLightSetting,
            },
          },
        };
      }
      case 'CHANGE_SWITCH': {
        const { value } = action;
        const current = state.current;
        // alert('nnnn');
        TYSdk.device.putDeviceData({ switch_led: value });
        console.log(value);
        TYSdk.device.getDeviceInfo().then(data => {
          console.log('data :>> ', data);
        });
        // setTimeout(() => {
        //   TYSdk.device.putDeviceData({ switch_led: false });
        //   TYSdk.device.getDeviceInfo().then(data => {
        //     console.log('data :>> ', data);
        //   });
        // }, 2000);

        AsyncStorage.setItem(`${current}_switch`, value ? 'on' : 'off');
        return {
          ...state,
          ...{
            [current + '_switch']: value,
          },
        };
      }
      case 'INIT_SCENE': {
        const { scene } = action;
        const current = state.current;
        return {
          ...state,
          [`${current}_scene`]: scene || [],
        };
      }
      case 'ADD_SCENE': {
        const { name, setting } = action;
        const current = state.current;
        const sceneList = state[`${current}_scene`] || [];

        const newSceneList = sceneList.concat({
          name,
          setting,
        });

        AsyncStorage.setItem(`${current}_scene`, JSON.stringify(newSceneList));

        return {
          ...state,
          [`${current}_scene`]: newSceneList,
        };
      }
      case 'CHANGE_SCENE': {
        const { index, name, setting } = action;
        const current = state.current;
        const sceneList = state[`${current}_scene`] || [];

        const newSceneList = sceneList.map((sItem, sIndex) => {
          if (sIndex === index) {
            sItem.name = name;
            sItem.setting = setting;
          }
          return sItem;
        });

        AsyncStorage.setItem(`${current}_scene`, JSON.stringify(newSceneList));

        return {
          ...state,
          ...{
            [`${current}_scene`]: newSceneList,
          },
        };
      }
      case 'DELETE_SCENE': {
        const { index } = action;
        const current = state.current;
        const sceneList = state[`${current}_scene`] || [];

        sceneList.splice(index, 1);

        const newSceneList = [...sceneList];

        AsyncStorage.setItem(`${current}_scene`, JSON.stringify(newSceneList));

        return {
          ...state,
          ...{
            [`${current}_scene`]: newSceneList,
          },
        };
      }
      case 'INIT_TIMER': {
        const { timer } = action;
        const current = state.current;

        return {
          ...state,
          [`${current}_timer`]: timer || [],
        };
      }
      case 'ADD_TIMER': {
        const { timer } = action;
        const current = state.current;
        const timerList = state[`${current}_timer`] || [];

        const newTimerList = timerList.concat(timer);

        AsyncStorage.setItem(`${current}_timer`, JSON.stringify(newTimerList));

        return {
          ...state,
          [`${current}_timer`]: newTimerList,
        };
      }
      case 'CHANGE_TIMER': {
        const { index, timer } = action;
        const current = state.current;
        const timerList = state[`${current}_timer`] || [];

        const newTimerList = timerList.map((item, sIndex) => {
          if (sIndex === index) {
            item = {
              ...timer,
            };
          }
          return item;
        });

        return {
          ...state,
          ...{
            [`${current}_timer`]: newTimerList,
          },
        };
      }
      default:
        return productState;
    }
  },
};
