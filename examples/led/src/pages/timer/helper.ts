import { TYSdk } from 'tuya-panel-kit';
import { minToTimeStr, getLoopDaysLabel, binStrToHex } from '@utils';
import { color, productConfig } from '@config';

const { channelSchemaMap, schemaChanelMap } = productConfig.maps;

function getIdSwitchBytes(id, running) {
  const rtc_running = running ? '1' : '0';
  const rtc_id = id.toString(2).padStart(7, '0');
  return binStrToHex(rtc_running + rtc_id, 2);
}

function getLoopBytes(item) {
  const { loopDays } = item;
  const result = [0, 0, 0, 0, 0, 0, 0, 0];
  loopDays.forEach(day => {
    result[day] = 1;
  });
  return binStrToHex(result.join(''), 2);
}

function getStartTimeBytes(item) {
  return item.startTime.toString(16).padStart(4, '0');
}

function getStartActionBytes(item) {
  const { setting, multiwaySwitch } = item;

  const result = {
    bright_value: null,
    red_bright_value: null,
    blue_bright_value: null,
    purple_bright_value: null,
    uvc_bright_value: null,
  };

  Object.entries(setting).forEach(([key, value]) => {
    const swithStr = multiwaySwitch[key] ? '01' : '00';
    const valueStr = Math.floor(value / 10)
      .toString(16)
      .padStart(2, '0');

    result[key] = swithStr + valueStr;
  });

  const other = '00000000'; // uva 循环开关 / 开时长 / 关时长 / 00

  return (
    '09' +
    (result.bright_value || '') +
    (result.red_bright_value || '') +
    (result.blue_bright_value || '') +
    (result.purple_bright_value || '') +
    (result.uvc_bright_value || '') +
    other
  );
}

function getEndTimeBytes(item) {
  return item.endTime.toString(16).padStart(4, '0');
}

export function putSetTimer(id, item, running) {
  const rtc_running_id = getIdSwitchBytes(id, running);
  const rtc_timer_type = '01';
  const rtc_loop = getLoopBytes(item);
  const rtc_start_time = getStartTimeBytes(item);
  const rtc_start_action = getStartActionBytes(item);
  const rtc_end_time = getEndTimeBytes(item);
  const rtc_end_action = '08';

  const result =
    rtc_running_id +
    rtc_timer_type +
    rtc_loop +
    rtc_start_time +
    rtc_start_action +
    rtc_end_time +
    rtc_end_action;

  TYSdk.device.putDeviceData({
    rtc_timer: result.toUpperCase(),
    // timer_report: binStrToHex(rtc_bin_running + rtc_bin_id, 2),
  });
}

export function putDeleteTimer(id, running = false) {
  const rtc_running_id = getIdSwitchBytes(id, running);
  const rtc_timer_type = '00';

  const result = rtc_running_id + rtc_timer_type;

  TYSdk.device.putDeviceData({
    rtc_timer: result.toUpperCase(),
  });
}

export function getTimerId(timer, current) {
  let result = 1;
  const currentTimers = timer[current] || [];
  const currentIds = currentTimers.map(item => item.id);

  const sortIds = currentIds.sort();

  for (let i = 0; i < sortIds.length; i++) {
    if (sortIds[i] === result) {
      result++;
    } else {
      break;
    }
  }

  return result;
}
