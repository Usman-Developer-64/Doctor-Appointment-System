import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TelemedicineMessage, TelemedicineMessageDocument } from './schemas/message.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'telemedicine',
})
export class TelemedicineGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectModel(TelemedicineMessage.name)
    private readonly messageModel: Model<TelemedicineMessageDocument>,
  ) {}

  handleConnection(client: Socket) {
    console.log(`⚡ Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string; name: string },
  ) {
    client.join(data.roomId);
    
    // Join the user's personal channel for background notifications
    if (data.userId) {
      client.join(`user_${data.userId}`);
    }
    
    try {
      // 1. Fetch chat history for this room from MongoDB (ordered by date)
      const history = await this.messageModel
        .find({ roomId: data.roomId })
        .sort({ createdAt: 1 })
        .exec();
        
      // Send past messages to the joining user only
      client.emit('chat-history', history);
    } catch (err) {
      console.error('Failed to retrieve chat history:', err);
    }

    client.to(data.roomId).emit('user-joined', {
      socketId: client.id,
      userId: data.userId,
      name: data.name,
    });
    console.log(`👤 User ${data.name} joined room: ${data.roomId}`);
  }

  @SubscribeMessage('send-message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    try {
      // 2. Save the incoming message to MongoDB
      const savedMsg = new this.messageModel({
        roomId: data.roomId,
        senderName: data.senderName,
        text: data.text,
        attachmentType: data.attachmentType || null,
        attachmentUrl: data.attachmentUrl || null,
        fileName: data.fileName || null,
      });
      await savedMsg.save();

      // 3. Relay the message to other room members
      client.to(data.roomId).emit('receive-message', {
        senderName: data.senderName,
        text: data.text,
        attachmentType: data.attachmentType,
        attachmentUrl: data.attachmentUrl,
        fileName: data.fileName,
        createdAt: (savedMsg as any).createdAt,
      });

      // 4. Relay background notification to recipient's personal room channel
      if (data.recipientId) {
        this.server.to(`user_${data.recipientId}`).emit('new-message-notification', {
          roomId: data.roomId,
          senderName: data.senderName,
          text: data.text,
          attachmentType: data.attachmentType,
          attachmentUrl: data.attachmentUrl,
          fileName: data.fileName,
          createdAt: (savedMsg as any).createdAt,
        });
      }
    } catch (err) {
      console.error('Failed to save chat message:', err);
    }
  }

  @SubscribeMessage('call-user')
  handleCallUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; offer: any },
  ) {
    client.to(data.roomId).emit('call-made', {
      socketId: client.id,
      offer: data.offer,
    });
  }

  @SubscribeMessage('make-answer')
  handleMakeAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; answer: any },
  ) {
    client.to(data.roomId).emit('answer-made', {
      socketId: client.id,
      answer: data.answer,
    });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; candidate: any },
  ) {
    client.to(data.roomId).emit('ice-candidate-received', {
      socketId: client.id,
      candidate: data.candidate,
    });
  }

  @SubscribeMessage('toggle-media')
  handleToggleMedia(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; type: 'video' | 'audio'; enabled: boolean },
  ) {
    client.to(data.roomId).emit('media-state-changed', {
      type: data.type,
      enabled: data.enabled,
    });
  }

  @SubscribeMessage('respond-online')
  handleRespondOnline(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; name: string },
  ) {
    client.to(data.roomId).emit('peer-online', {
      name: data.name,
    });
  }

  @SubscribeMessage('get-custom-rooms')
  async handleGetCustomRooms(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    try {
      // Find all distinct room IDs for the user
      const roomIds = await this.messageModel
        .find({ roomId: { $regex: data.userId } })
        .distinct('roomId')
        .exec();

      const customRoomsList = [];

      for (const roomId of roomIds) {
        if (roomId.startsWith('chat_')) {
          const parts = roomId.split('_');
          const partnerId = parts[1] === data.userId ? parts[2] : parts[1];

          try {
            // Raw mongoose database driver lookup for the partner user details
            const partner = await this.messageModel.db
              .collection('users')
              .findOne({ _id: new Object(partnerId) });

            if (partner) {
              const lastMsg = await this.messageModel
                .findOne({ roomId })
                .sort({ createdAt: -1 })
                .exec();

              customRoomsList.push({
                roomId,
                partnerName: partner.role === 'doctor' ? `Dr. ${partner.firstName} ${partner.lastName}` : `${partner.firstName} ${partner.lastName}`,
                partnerId,
                specialization: partner.specialization || 'Patient Inquiry',
                date: lastMsg ? lastMsg.createdAt : new Date(),
                lastMessageText: lastMsg ? lastMsg.text : 'Click to chat...',
              });
            }
          } catch (err) {
            console.error('Error looking up partner for room:', roomId, err);
          }
        }
      }

      client.emit('custom-rooms-list', customRoomsList);
    } catch (e) {
      console.error(e);
    }
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; name: string },
  ) {
    client.leave(data.roomId);
    client.to(data.roomId).emit('user-left', {
      name: data.name,
      lastSeen: new Date().toISOString(),
    });
  }
}
