import type { Socket } from 'socket.io';
import type { ResType } from 'src/types/common';

export const send = <T>(client: Socket, events: string, data: ResType<T>) => {
  client.emit(events, data);
};

export const sendBroadcast = <T>(
  client: Socket,
  roomNumber: string,
  events: string,
  data: ResType<T>,
) => {
  client.to(roomNumber).emit(events, data);
};
