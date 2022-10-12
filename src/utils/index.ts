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
