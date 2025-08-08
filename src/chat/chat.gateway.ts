import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) { }

  handleConnection(client: Socket) {

  }

  handleDisconnect(client: Socket) {

  }

  @SubscribeMessage('join')
  async handleJoinRoom(
    @MessageBody() data: { courseId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const hasAccess = await this.chatService.validateUserAccess(data.courseId, data.userId,'');

      if (!hasAccess) {
        client.emit('error', { message: 'Access denied' });
        return;
      }

      const roomId = `course_${data.courseId}`;
      client.join(roomId);
      client.emit('joined', { message: `Joined course chat ${data.courseId}` });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: { courseId: number; senderId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const message = await this.chatService.saveMessage(data,'');
      const roomId = `course_${data.courseId}`;

      const formattedMessage = {
        messageId: message.messageId,
        content: message.content,
        sender: {
          userId: message.sender.userId,
          userName: message.sender.userName,
          role: message.sender.role
        },
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
      };

      client.to(roomId).emit('message', formattedMessage);
      client.emit('message', formattedMessage);
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
