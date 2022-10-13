import { AsyncStorage } from 'react-native';
import { handleActions, createAction } from 'redux-actions';
import { TYSdk } from 'tuya-panel-kit';
// interface GradientTime {
//   [productType: string]: number
// }
interface Scene {
  [productType: string]: object[];
}
interface Timer {
  [productType: string]: object[];
}
interface ProductState {
  showFooter: boolean;
  current: string;
  // gradientTime: GradientTime;
  scene: Scene;
  timer: Timer;
}

const productState: ProductState = {
  showFooter: true,
  current: 'RB',
  // gradientTime: {},
  scene: [] as any,
  timer: [] as any,
};

const changeFooterVisible = createAction('CHANGE_FOOTER_VISIBLE');
const changeCurrent = createAction('CHANGE_CURRENT');
// const changeGradientTime = createAction('CHANGE_GRADIENT_TIME');
// const changeLightSetting = createAction('CHANGE_LIGHT_SETTING');
const initScene = createAction('INIT_SCENE');
const addScene = createAction('ADD_SCENE');
const changeScene = createAction('CHANGE_SCENE');
const deleteScene = createAction('DELETE_SCENE');
const initTimer = createAction('INIT_TIMER');
const addTimer = createAction('ADD_TIMER');
const changeTimer = createAction('CHANGE_TIMER');

export const actions = {
  changeFooterVisible,
  changeCurrent,
  // changeGradientTime,
  // changeLightSetting,
  initScene,
  addScene,
  changeScene,
  deleteScene,
  initTimer,
  addTimer,
  changeTimer,
};

export const product = handleActions<any>(
  {
    CHANGE_FOOTER_VISIBLE: (state, action) => {
      return {
        ...state,
        showFooter: action.payload.visible,
      };
    },
    CHANGE_CURRENT: (state, action) => {
      const current = action.payload;
      AsyncStorage.setItem('current', current);
      return {
        ...state,
        current,
      };
    },
    // CHANGE_GRADIENT_TIME: (state, action) => {
    //   const time = action.payload;
    //   const current = state.current;

    //   const newGradientTime = {
    //     ...state.gradientTime,
    //     [current]: time
    //   }

    //   AsyncStorage.setItem('gradientTime', JSON.stringify(newGradientTime));

    //   return {
    //     ...state,
    //     ...{
    //       gradientTime:
    //       [current + '_gradientTime']: time,
    //     },
    //   };
    // },
    // CHANGE_LIGHT_SETTING: (state, action) => {
    //   const { setting } = action.payload;
    //   const current = state.current;

    //   const lightSetting = state[current + '_lightSetting'] || {};

    //   const newLightSetting = {
    //     ...lightSetting,
    //     ...setting,
    //   };

    //   AsyncStorage.setItem(`${current}_lightSetting`, JSON.stringify(newLightSetting));

    //   return {
    //     ...state,
    //     ...{
    //       [current + '_lightSetting']: {
    //         ...newLightSetting,
    //       },
    //     },
    //   };
    // },
    INIT_SCENE: (state, action) => {
      const { scene } = action.payload;
      const current = state.current;
      return {
        ...state,
        [`${current}_scene`]: scene || [],
      };
    },
    ADD_SCENE: (state, action) => {
      const { name, setting } = action.payload;
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
    },
    CHANGE_SCENE: (state, action) => {
      const { index, name, setting } = action.payload;
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
    },
    DELETE_SCENE: (state, action) => {
      const { index } = action.payload;
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
    },
    INIT_TIMER: (state, action) => {
      const { timer } = action.payload;
      const current = state.current;

      return {
        ...state,
        [`${current}_timer`]: timer || [],
      };
    },
    ADD_TIMER: (state, action) => {
      const { timer } = action.payload;
      const current = state.current;
      const timerList = state[`${current}_timer`] || [];

      const newTimerList = timerList.concat(timer);

      AsyncStorage.setItem(`${current}_timer`, JSON.stringify(newTimerList));

      return {
        ...state,
        [`${current}_timer`]: newTimerList,
      };
    },
    CHANGE_TIMER: (state, action) => {
      const { index, timer } = action.payload;
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
    },
  },
  productState
);

export const reducers = {
  product,
};
