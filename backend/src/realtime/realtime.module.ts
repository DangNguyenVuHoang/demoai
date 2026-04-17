import { Module } from '@nestjs/common';
import { SeatMapGateway } from './seat-map.gateway';

@Module({
  providers: [SeatMapGateway],
  exports: [SeatMapGateway],
})
export class RealtimeModule {}