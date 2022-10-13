import Storage from './index';

// Storage.getItem()

// export default AsyncStorage

export function getLocalStorage() {
  return {
    product: {
      RB: {
        lightSetting: {},
        sceneList: [],
        timerList: [],
      },
      RBWFrUv: {},
      RBFr: {},
      RW: {},
    },
    current: 'RB',
  };
}
