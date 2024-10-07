import { Injectable } from '@nestjs/common';
import { send, sendBroadcast } from 'src/utils/send';
import { timeFormat } from 'src/utils/timeFormat';
import YoLog from 'src/utils/yoLog';
import type { Socket } from 'socket.io';
import type { ChatCacheType } from 'src/types/chat';

@Injectable()
export class ChatService {
  constructor() {}

  // clientAliases = new Map<string, string>(); // 用于存储 实例id 和 实例别名 的映射
  chatCache = new Map<string, ChatCacheType[]>(); // 用于存储 房间 和 房间内聊天信息 的映射
  roomCache = new Map<string, Map<string, string>>(); // 用于存储 房间 和 房间内成员信息 的映射，其中成员信息是 实例id 和实例别名 的映射

  // 生成随机房间号，规则: 6位整数，第一位不能为0
  generateRandomNumber() {
    const firstDigit = Math.floor(Math.random() * 9) + 1; // 生成1到9之间的随机数
    let remainingDigits = '';
    for (let i = 0; i < 8; i++) {
      remainingDigits += Math.floor(Math.random() * 10); // 生成0到9之间的随机数
      if (i === 1 || i === 4) remainingDigits += '-';
    }
    return firstDigit + remainingDigits;
  }

  // 创建聊天室
  createRoom(client: Socket, nickname: string) {
    if (nickname.trim() === '') {
      send(client, 'onCreateRoomRes', {
        code: 400,
        desc: '请输入昵称',
        data: null,
      });
      return;
    }
    let roomNumber = '';
    let roomExists = true;
    let createTimes = 0;
    while (roomExists && createTimes < 10000) {
      roomNumber = this.generateRandomNumber();
      roomExists = client.nsp.adapter.rooms.has(roomNumber);
      createTimes++;
    }
    if (createTimes >= 10000) {
      send(client, 'onCreateRoomRes', {
        code: 500,
        desc: '房间创建超时 - 暂无房间号可分配 - 请稍后再试',
        data: null,
      });
      return;
    }
    YoLog.clientAction(client.id, '创建新的聊天室: ' + roomNumber);
    this.chatCache.set(roomNumber, []); // 定义房间聊天信息存放位置
    // 缓存实例id与用户名
    const clientAliases = new Map();
    clientAliases.set(client.id, nickname);
    this.roomCache.set(roomNumber, clientAliases); // 将实例id与用户名存放于房间信息内
    client.join(roomNumber);
    YoLog.roomAction(roomNumber, '聊天室创建成功');
    this.chatCache.get(roomNumber).push({
      id: this.chatCache.get(roomNumber).length,
      clientId: client.id,
      nickname: nickname,
      type: 'userAction',
      time: timeFormat(new Date().getTime(), 'YYYY-MM-DD hh:mm:ss'),
      data: '创建了聊天室',
    });
    // 告诉实例房间创建成功
    send(client, 'onCreateRoomRes', {
      code: 200,
      desc: '',
      data: {
        clientId: client.id,
        nickname: nickname,
        roomNumber: roomNumber,
        chatCache: this.chatCache.get(roomNumber),
      },
    });
  }

  // 加入聊天室
  joinRoom(client: Socket, nickname: string, roomNumber: string) {
    // 判断房间号是否存在
    if (!client.nsp.adapter.rooms.has(roomNumber)) {
      send(client, 'onJoinRoomRes', {
        code: 404,
        desc: '该房间号不存在',
        data: null,
      });
      YoLog.clientAction(
        client.id,
        `加入聊天室(${roomNumber})失败，因为该聊天室不存在`,
        'error',
      );
      return;
    }
    // 判断要加入的房间内是否已有该用户名
    if (
      Array.from(this.roomCache.get(roomNumber).values()).includes(nickname)
    ) {
      send(client, 'onJoinRoomRes', {
        code: 400,
        desc: '该房间内该昵称已被占用',
        data: null,
      });
      YoLog.clientAction(
        client.id,
        `加入聊天室(${roomNumber})失败，因为昵称已被占用`,
        'error',
      );
      return;
    }
    client.join(roomNumber); // 将该实例加入房间
    const item: ChatCacheType = {
      id: this.chatCache.get(roomNumber).length,
      clientId: client.id,
      nickname: nickname,
      type: 'userAction',
      time: timeFormat(new Date().getTime(), 'YYYY-MM-DD hh:mm:ss'),
      data: '加入了聊天室',
    };
    this.chatCache.get(roomNumber).push(item);
    // 通知实例加入成功
    send(client, 'onJoinRoomRes', {
      code: 200,
      desc: '',
      data: {
        clientId: client.id,
        nickname,
        roomNumber,
        chatCache: this.chatCache.get(roomNumber),
      },
    });
    // 通知房间内其他实例有新实例加入
    sendBroadcast(client, roomNumber, 'onNewUserJoin', {
      code: 200,
      desc: '',
      data: item,
    });
    // 缓存实例id与用户名
    this.roomCache.get(roomNumber).set(client.id, nickname);
    YoLog.clientAction(client.id, `加入了聊天室(${roomNumber})`);
  }

  // 客户端离线
  clientOff(client: Socket) {
    const rooms = Array.from(client.rooms);
    if (rooms.length <= 1) return;
    const roomNumber = rooms[1];
    const nickname = this.roomCache.get(roomNumber).get(client.id);
    // 通知聊天室该实例离线
    const item: ChatCacheType = {
      id: this.chatCache.get(roomNumber).length,
      clientId: client.id,
      nickname: nickname,
      type: 'userAction',
      data: '离开了聊天室',
      time: timeFormat(new Date().getTime(), 'YYYY-MM-DD hh:mm:ss'),
    };
    this.chatCache.get(roomNumber).push(item);
    this.roomCache.get(roomNumber).delete(client.id);
    sendBroadcast(client, roomNumber, 'onUserOff', {
      code: 200,
      desc: '',
      data: item,
    });
    YoLog.clientAction(client.id, `客户端离开了聊天室: ${roomNumber}`);
    const numberNum = client.nsp.adapter.rooms.get(roomNumber)?.size;
    if (numberNum === 1) {
      YoLog.clientAction(client.id, `是聊天室(${roomNumber})的最后一个实例`);
      this.chatCache.delete(roomNumber);
      this.roomCache.delete(roomNumber);
      YoLog.roomAction(roomNumber, '聊天室已解散');
    }
  }

  // 接收客户端发来的消息
  receiveClientMessage(
    client: Socket,
    message: string,
    type: ChatCacheType['type'],
  ) {
    const roomNumber = Array.from(client.rooms)[1];
    if (!roomNumber) {
      send(client, 'confirmSendMessageOK', {
        code: 400,
        desc: '聊天室错误，信息发送失败',
        data: null,
      });
      YoLog.clientAction(client.id, `聊天室(${roomNumber})异常丢失`, 'error');
      return;
    }
    const nickname = this.roomCache.get(roomNumber).get(client.id);
    const item: ChatCacheType = {
      id: this.chatCache.get(roomNumber).length,
      clientId: client.id,
      nickname,
      type: type,
      data: message,
      time: timeFormat(new Date().getTime(), 'YYYY-MM-DD hh:mm:ss'),
    };
    this.chatCache.get(roomNumber).push(item);
    sendBroadcast(client, roomNumber, 'receiveClientMessageRes', {
      code: 200,
      desc: '',
      data: item,
    });
    send(client, 'confirmSendMessageOK', {
      code: 200,
      desc: '',
      data: item,
    });
  }
}
