// 时间格式化方法，用于将时间戳转换为格式化的时间
// 该方法接收两个参数，返沪一个字符串
// time: number 时间戳
// type: 要转换的时间格式
export const timeFormat = (
  time: number,
  type: 'YYYY-MM-DD hh:mm:ss' | 'YYYY-MM-DD hh:mm' | 'YYYY-MM-DD',
): string => {
  const date = new Date();
  date.setTime(time);
  const YYYY = date.getFullYear();
  const MM = preAddZero((date.getMonth() + 1).toString(), 2);
  const DD = preAddZero(date.getDate().toString(), 2);

  if (type === 'YYYY-MM-DD') return `${YYYY}-${MM}-${DD}`;

  if (type === 'YYYY-MM-DD hh:mm:ss') {
    const hh = preAddZero(date.getHours().toString(), 2);
    const mm = preAddZero(date.getMinutes().toString(), 2);
    const ss = preAddZero(date.getSeconds().toString(), 2);
    return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
  }

  if (type === 'YYYY-MM-DD hh:mm') {
    const hh = preAddZero(date.getHours().toString(), 2);
    const mm = preAddZero(date.getMinutes().toString(), 2);
    return `${YYYY}-${MM}-${DD} ${hh}:${mm}`;
  }

  return '时间格式有误';
};

const preAddZero = (str: string, length: number): string => {
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
};
