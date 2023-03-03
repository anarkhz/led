import { TYSdk } from 'tuya-panel-kit';
/**
 * 分 5 个阶段启动
 * 每 300ms 升一阶段
 */
/**
 * eg.
 * setting: {
 *  red_bright_value: 1000,
 *  blue_bright_value: 480,
 * }
 */
let currentStage = 0;
let currentRecommend = {};
let slowStartFlight = [];

function doSlowStart() {
  if (currentStage >= 5) return;
  TYSdk.device.putDeviceData(slowStartFlight[currentStage]);
  currentStage++;
  if (currentStage < 5) {
    setTimeout(() => {
      doSlowStart();
    }, 300);
  }
}

export function slowStart(setting = {}) {
  if (JSON.stringify(setting) === JSON.stringify(currentRecommend)) {
    return;
  } else {
    currentRecommend = setting;
  }

  currentStage = 0;
  slowStartFlight = [];

  const keys = Object.keys(setting);

  for (let i = 1; i < 6; i++) {
    const flightItem = {};
    keys.forEach(key => {
      flightItem[key] = (setting[key] / 5) * i;
    });
    slowStartFlight.push(flightItem);
  }

  doSlowStart();
}
