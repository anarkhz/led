import theme, { color } from './theme';
import dpCodes from './dpCodes';
import icon from './icon';

import controlSchema from './product/controlSchema';
import switchSchema from './product/switchSchema';
import listSchema from './product/listSchema';

import recommend from './product/recommend';

import defaultSetting from './product/defaultSetting';
import defaultSwitch from './product/defaultSwitch';

import * as maps from './product/maps';

const productConfig = {
  controlSchema,
  switchSchema,
  listSchema,
  defaultSetting,
  defaultSwitch,
  recommend,
  maps,
};

export { dpCodes, theme, color, icon, productConfig };
