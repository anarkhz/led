import _ from 'lodash';

const recommend = {
  RB: [
    {
      text: 'R:B=1:1',
      setting: {
        R: 10,
        B: 10,
        brightness: 100,
      },
    },
    {
      text: 'R:B=1:2',
      setting: {
        R: 10,
        B: 20,
        brightness: 100,
      },
    },
    {
      text: 'R:B=1:3',
      setting: {
        R: 10,
        B: 30,
        brightness: 100,
      },
    },
    {
      text: 'R:B=1:4',
      setting: {
        R: 10,
        B: 40,
        brightness: 100,
      },
    },
  ],
};

const productSchema = {
  RB: [
    'red_bright_value',
    'blue_bright_value',
    'purple_bright_value',
    'uvc_bright_value',
    'bright_value',
    'all_bright',
  ],
};

const custom = {
  RB: [
    {
      label: 'R',
      key: 'R',
      value: 0,
    },
    {
      label: 'B',
      key: 'B',
      value: 0,
    },
    {
      label: '亮度',
      key: 'brightness',
      value: 0,
    },
  ],
};

const defaultSetting = {
  RB: {
    R: 0,
    B: 0,
    brightness: 0,
  },
};

export function useSettingConfig(current) {
  return _.cloneDeep({
    recommend: recommend[current] || [],
    custom: custom[current] || [],
    defaultSetting: defaultSetting[current] || {},
    productSchema: productSchema[current] || [],
  });
}

export { recommend };
