/* eslint-disable import/prefer-default-export */
import { Utils } from 'tuya-panel-kit';
import { store } from '../models';
import Strings from '../i18n';

export const getFaultStrings = (faultCode: string, faultValue: number, onlyPrior = true) => {
  const { devInfo } = store.getState();
  if (!faultValue) return '';
  const { label } = devInfo.schema[faultCode];
  const labels: string[] = [];
  for (let i = 0; i < label!.length; i++) {
    const value = label![i];
    const isExist = Utils.NumberUtils.getBitValue(faultValue, i);
    if (isExist) {
      labels.push(Strings.getDpLang(faultCode, value));
      if (onlyPrior) break;
    }
  }
  return onlyPrior ? labels[0] : labels.join(', ');
};

export const minToTimeStr = min => {
  const hour = Math.floor(min / 60);
  const remainMin = min % 60;
  return hour.toString().padStart(2, '0') + ':' + remainMin.toString().padStart(2, '0');
};

export function getLoopDaysLabel(loopDays) {
  enum WEEK_MAP {
    '周一' = 1,
    '周二',
    '周三',
    '周四',
    '周五',
    '周六',
    '周日',
  }
  if (!loopDays) return '一次';
  if (loopDays.length === 0) {
    return '一次';
  } else if (loopDays.length === 7) {
    return '每天';
  } else {
    return loopDays
      .sort()
      .map(d => WEEK_MAP[d])
      .join(', ');
  }
}

export function binStrToHex(str, digit, padNum = '0') {
  const decimal = parseInt(str, 2);
  return digit ? decimal.toString(16).padStart(digit, padNum) : decimal.toString(16);
}

/**
 * ABCDEFG 7字节； A：设备动作；BCDEFG：动作参数；
 * A=0x00，关灯，BCDEFG无效；
 * A=0x01，开灯，BCDEFG无效；
 * A=0x02，白光，
 *  B：亮度，1-100，
 *  C：色温，0-100，DEFG无效；
 * A=0x03，彩光，
 *  BC：色度，0-360，
 *  D：饱和度，0-100，
 *  E：彩光亮度，0-100，FG无效；
 * A=0x04，混光，RGBCW全亮，
 *  BC：色度，0-360，
 *  D：饱和度，0-100，
 *  E：彩光亮度，1-100，
 *  F：白光亮度，1-100，
 *  G：色温，0-100；
 * A=0x05，情景，
 *  B：场景ID，0-15，CDEFG无效；
 * A=0x06，节能，B：场景ID，0-15，
 *  C：节能开关，0-关，1-开，DEFG无效；
 * A=0x07，太阳能，
 *  BC：色度，0-360，
 *  D：饱和度，0-100，
 *  E：彩光亮度，1-100，
 *  F：白光亮度，1-100，
 *  G：色温，0-100；
 * A=0x08，执行定时前状态，BCDEFG无效；
 */
