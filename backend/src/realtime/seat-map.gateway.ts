import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SeatMapGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(SeatMapGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Socket connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinShowtimeRoom')
  handleJoinShowtimeRoom(
    @MessageBody() payload: { showtimeId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = this.getRoomName(payload.showtimeId);
    client.join(roomName);

    this.logger.log(`Socket ${client.id} joined room ${roomName}`);

    return {
      event: 'joinedShowtimeRoom',
      data: {
        showtimeId: payload.showtimeId,
        roomName,
      },
    };
  }

  @SubscribeMessage('leaveShowtimeRoom')
  handleLeaveShowtimeRoom(
    @MessageBody() payload: { showtimeId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = this.getRoomName(payload.showtimeId);
    client.leave(roomName);

    this.logger.log(`Socket ${client.id} left room ${roomName}`);

    return {
      event: 'leftShowtimeRoom',
      data: {
        showtimeId: payload.showtimeId,
        roomName,
      },
    };
  }

  emitSeatMapUpdated(showtimeId: string, payload?: Record<string, any>) {
    const roomName = this.getRoomName(showtimeId);

    this.server.to(roomName).emit('seatMapUpdated', {
      showtimeId,
      ...payload,
    });

    this.logger.log(`Broadcast seatMapUpdated to ${roomName}`);
  }

  private getRoomName(showtimeId: string): string {
    return `showtime:${showtimeId}`;
  }
}