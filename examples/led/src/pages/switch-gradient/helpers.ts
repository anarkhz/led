/**
 * Slider 刻度(openTime)
 * [0 - 119s](1) ---- [2min - 29.5min](0.5) ----- [0.5h - 3h](0.5)
 * (0 - 119) + (120 - 175) + (176 - 181)
 */
export function openTimeToText(openTime) {
  if (openTime >= 0 && openTime < 120) {
    return `${openTime}s`;
  } else if (openTime >= 120 && openTime < 176) {
    return `${(openTime - 120) / 2 + 2}min`;
  } else if (openTime >= 176 && openTime <= 181) {
    return `${(openTime - 175) / 2}h`;
  }
}

export function openTimeToSecondTime(openTime) {
  openTime = Math.round(openTime);
  if (openTime >= 0 && openTime < 120) {
    return openTime;
  } else if (openTime >= 120 && openTime < 176) {
    return 120 + (openTime - 120) * 30;
  } else if (openTime >= 176 && openTime <= 181) {
    return (openTime - 175) * 60 * 30;
  }
}

export function secondTimeToOpenTime(secondTime) {
  if (secondTime >= 0 && secondTime < 120) {
    return Math.round(secondTime);
  } else if (secondTime >= 120 && secondTime < 0.5 * 60 * 60) {
    return Math.round(120 + (secondTime - 120) / 30);
  } else if (secondTime >= 0.5 * 60 * 60 && secondTime <= 3 * 60 * 60) {
    return Math.round(176 + (secondTime - 1800) / 1800);
  } else {
    return 0;
  }
}

export function switchGradientToSecondTime(switchGradient) {
  const hexStr = switchGradient.slice(2, 8);
  const secTime = Math.round(parseInt(hexStr, 16) / 1000);
  return secTime;
}
