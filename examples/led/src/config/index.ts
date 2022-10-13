import theme, { color } from './theme';
import dpCodes from './dpCodes';
import icon from './icon';

import controlSchema from './product/controlSchema';
import defaultSetting from './product/defaultSetting';
import listSchema from './product/listSchema';
import recommend from './product/recommend';

const productConfig = {
  controlSchema,
  defaultSetting,
  listSchema,
  recommend,
};

export { dpCodes, theme, color, icon, productConfig };
