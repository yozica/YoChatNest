import { timeFormat } from './timeFormat';

const styles = {
  reset: '\x1B[0m',
  bright: '\x1B[1m',
  grey: '\x1B[2m',
  italic: '\x1B[3m',
  underline: '\x1B[4m',
  reverse: '\x1B[7m',
  hidden: '\x1B[8m',
  black: '\x1B[30m',
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  magenta: '\x1B[35m',
  cyan: '\x1B[36m',
  white: '\x1B[37m',
  blackBG: '\x1B[40m',
  redBG: '\x1B[41m',
  greenBG: '\x1B[42m',
  yellowBG: '\x1B[43m',
  blueBG: '\x1B[44m',
  magentaBG: '\x1B[45m',
  cyanBG: '\x1B[46m',
  whiteBG: '\x1B[47m',
};

export default class YoLog {
  static colors = (
    keys: keyof typeof styles | (keyof typeof styles)[],
    message: string,
  ) => {
    let values = '';
    if (typeof keys === 'string') {
      values = styles[keys];
    } else {
      keys.forEach((key) => {
        values += styles[key];
      });
    }
    return values + message + styles['reset'];
  };

  static clientAction(
    clientId: string,
    action: string,
    type: 'default' | 'error' = 'default',
  ) {
    console.log(
      this.colors('green', '[YoLog]') +
        ' - ' +
        timeFormat(new Date().getTime(), 'YYYY-MM-DD hh:mm:ss') +
        '     ' +
        this.colors('green', 'ClientAction') +
        ' ' +
        this.colors('yellow', `[${clientId}]`) +
        ' ' +
        (type === 'default'
          ? action
          : this.colors(type === 'error' ? 'red' : 'reset', action)),
    );
  }

  static roomAction(
    roomId: string,
    action: string,
    type: 'default' | 'error' = 'default',
  ) {
    console.log(
      this.colors('green', '[YoLog]') +
        ' - ' +
        timeFormat(new Date().getTime(), 'YYYY-MM-DD hh:mm:ss') +
        '     ' +
        this.colors('green', 'RoomAction') +
        ' ' +
        this.colors('yellow', `[${roomId}]`) +
        ' ' +
        (type === 'default'
          ? action
          : this.colors(type === 'error' ? 'red' : 'reset', action)),
    );
  }
}
