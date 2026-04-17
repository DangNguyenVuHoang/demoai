import { BadRequestException, Injectable } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class SeatLockService {
  private readonly LOCK_TTL_SECONDS = 5 * 60; // 5 phút, đồng bộ với expiredAt hiện tại
  // How status is stored in Redis:
  // Key: seat_lock:{showtimeId}:{seatId}
  // Value: 'LOCKED'
  // TTL: 5 phút (300 giây)
  // Khi lock một seat, chúng ta sẽ set key với TTL 5 phút. Nếu user không hoàn thành booking trong 5 phút, Redis sẽ tự động xóa key này, giải phóng seat.
  // Khi release seat, chúng ta sẽ xóa key ngay lập tức, giải phóng seat cho các user khác.
  // Khi kiểm tra xem seat có bị lock hay không, chúng ta sẽ kiểm tra sự tồn tại của key trong Redis. Nếu key tồn tại, nghĩa là seat đang bị lock.
  // Khi user cố gắng lock một seat đã bị lock bởi user khác, chúng ta sẽ trả về lỗi ngay lập tức, không cần phải chờ hết TTL.
  // Khi user hoàn thành booking thành công, chúng ta sẽ xóa key ngay lập tức để giải phóng seat.
  // Lưu ý: TTL của Redis và expiredAt trong database cần phải đồng bộ để tránh trường hợp booking đã bị Redis tự động release nhưng expiredAt vẫn còn thời
  // How many status can a seat have in Redis?
  // A seat can have two statuses in Redis:
  // 1. LOCKED: Khi seat đang bị lock bởi một user nào đó. Key sẽ tồn tại trong Redis với giá trị 'LOCKED' và có TTL 5 phút.
  // 2. Không tồn tại key: Khi seat không bị lock, key sẽ không tồn tại trong Redis. Điều này có nghĩa là seat đang sẵn sàng để được lock bởi bất kỳ user nào.
  constructor(private readonly redisService: RedisService) {}

  private getSeatLockKey(showtimeId: string, seatId: string): string {
    return `seat_lock:${showtimeId}:${seatId}`;
  }

  async lockSeats(showtimeId: string, seatIds: string[]): Promise<void> {
    const redis = this.redisService.getClient();
    const lockedKeys: string[] = [];

    try {
      for (const seatId of seatIds) {
        const key = this.getSeatLockKey(showtimeId, seatId);

        const result = await redis.set(
          key,
          'LOCKED',
          'EX',
          this.LOCK_TTL_SECONDS,
          'NX',
        );

        if (result !== 'OK') {
          throw new BadRequestException(
            `Seat ${seatId} is being locked by another user`,
          );
        }

        lockedKeys.push(key);
      }
    } catch (error) {
      if (lockedKeys.length > 0) {
        await redis.del(...lockedKeys);
      }
      throw error;
    }
  }

  async releaseSeats(showtimeId: string, seatIds: string[]): Promise<void> {
    const redis = this.redisService.getClient();
    const keys = seatIds.map((seatId) => this.getSeatLockKey(showtimeId, seatId));

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  async isSeatLocked(showtimeId: string, seatId: string): Promise<boolean> {
    const redis = this.redisService.getClient();
    const key = this.getSeatLockKey(showtimeId, seatId);
    const value = await redis.get(key);

    return !!value;
  }

  async getSeatLockValue(
    showtimeId: string,
    seatId: string,
  ): Promise<string | null> {
    const redis = this.redisService.getClient();
    const key = this.getSeatLockKey(showtimeId, seatId);

    return redis.get(key);
  }

  async getSeatLockTtl(showtimeId: string, seatId: string): Promise<number> {
    const redis = this.redisService.getClient();
    const key = this.getSeatLockKey(showtimeId, seatId);

    return redis.ttl(key);
  }
}