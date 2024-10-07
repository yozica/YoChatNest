import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';
import YoLog from 'src/utils/yoLog';
import type { ChatCacheType } from 'src/types/chat';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  // 监听客户端连接
  handleConnection(@ConnectedSocket() client: Socket) {
    YoLog.clientAction(client.id, '新的客户端连接');

    // 监听客户端断开 - 断开前触发
    client.on('disconnecting', () => {
      this.chatService.clientOff(client);
    });
  }

  // 监听客户端断开 - 断开后触发
  handleDisconnect(@ConnectedSocket() client: Socket) {
    YoLog.clientAction(client.id, '客户端断开连接');
  }

  // 监听创建聊天室事件
  @SubscribeMessage('onCreateRoom')
  onCreateRoom(
    @MessageBody() body: { nickname: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.chatService.createRoom(client, body.nickname);
  }

  // 监听加入聊天室事件
  @SubscribeMessage('onJoinRoom')
  onJoinRoom(
    @MessageBody() body: { nickname: string; roomNumber: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.chatService.joinRoom(client, body.nickname, body.roomNumber);
  }

  // 监听客户端发来的消息
  @SubscribeMessage('onClientSendMessage')
  onClientSendMessage(
    @MessageBody()
    body: { message: string; type?: ChatCacheType['type'] },
    @ConnectedSocket() client: Socket,
  ) {
    if (!body.type) {
      body.type = 'text';
    }
    this.chatService.receiveClientMessage(client, body.message, body.type);
  }
}
