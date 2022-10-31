import { TYSdk } from 'tuya-panel-kit';
import { binStrToHex } from '@utils';

function getIdBytes(id) {
  const rtc_id = id.toString(2);
  return binStrToHex(rtc_id, 2);
}

function getActionBytes(item) {
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
    (result.bright_value || '') +
    (result.red_bright_value || '') +
    (result.blue_bright_value || '') +
    (result.purple_bright_value || '') +
    (result.uvc_bright_value || '') +
    other
  );
}

export function putSetScene(item) {
  const scene_id = getIdBytes(item.id);
  const scene_action = getActionBytes(item);

  const result = scene_id + scene_action;

  TYSdk.device.putDeviceData({
    plant_scene_data: result.toUpperCase(),
  });
}

export function getSceneId(scene, current) {
  let result = 3;
  const currentScenes = scene[current];
  const currentIds = currentScenes.map(item => item.id);

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
