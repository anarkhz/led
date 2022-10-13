import { StyleSheet } from 'react-native';
import { Utils } from 'tuya-panel-kit';
const { convertX: cx, width: deviceWidth, height: deviceHeight } = Utils.RatioUtils;

import { color } from '@config';

export const commonStyles = StyleSheet.create({
  card: {
    width: deviceWidth - cx(32),
    margin: cx(16),
    backgroundColor: '#FFF',
    borderRadius: cx(4),
    padding: cx(12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  line: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mt8: {
    marginTop: cx(8),
  },
  button: {
    width: cx(72),
    height: cx(36),
    borderRadius: cx(4),
    // borderWidth: cx(1),
    backgroundColor: color.young,
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 1,
    // },
    // shadowOpacity: 0.5,
    // shadowRadius: 8,
    elevation: 8,
    marginVertical: cx(6),
  },
  buttonText: {
    fontSize: cx(18),
    color: '#fff',
  },
});
