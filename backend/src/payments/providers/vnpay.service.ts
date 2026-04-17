import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as querystring from 'qs';

@Injectable()
export class VNPayService {
  constructor(private readonly configService: ConfigService) {}

  createPaymentUrl(params: {
    amount: number;
    txnRef: string;
    clientIp: string;
    orderInfo: string;
  }): string {
    const tmnCode = this.configService.get<string>('VNPAY_TMN_CODE');
    const secretKey = this.configService.get<string>('VNPAY_HASH_SECRET');
    const vnpUrl = this.configService.get<string>('VNPAY_URL');
    const returnUrl = this.configService.get<string>('VNPAY_RETURN_URL');

    if (!tmnCode || !secretKey || !vnpUrl || !returnUrl) {
      throw new Error('Missing VNPay environment variables');
    }

    const createDate = this.formatDate(new Date());

    let vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: params.txnRef,
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: String(Math.round(params.amount * 100)),
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: params.clientIp || '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    vnpParams = this.sortObject(vnpParams);

    const signData = querystring.stringify(vnpParams, { encode: false });

    const secureHash = crypto
      .createHmac('sha512', secretKey)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    vnpParams.vnp_SecureHash = secureHash;

    return `${vnpUrl}?${querystring.stringify(vnpParams, { encode: false })}`;
  }

  verifyReturnUrl(query: Record<string, any>): boolean {
    const secretKey = this.configService.get<string>('VNPAY_HASH_SECRET');

    if (!secretKey) {
      throw new Error('Missing VNPAY_HASH_SECRET');
    }

    const vnpParams = { ...query };
    const secureHash = vnpParams.vnp_SecureHash;

    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    const sortedParams = this.sortObject(
      Object.fromEntries(
        Object.entries(vnpParams).map(([k, v]) => [k, String(v)]),
      ),
    );

    const signData = querystring.stringify(sortedParams, { encode: false });

    const signed = crypto
      .createHmac('sha512', secretKey)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    return secureHash === signed;
  }

  private sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj)
      .map((key) => encodeURIComponent(key))
      .sort();

    for (const key of keys) {
      sorted[key] = encodeURIComponent(obj[decodeURIComponent(key)]).replace(
        /%20/g,
        '+',
      );
    }

    return sorted;
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const HH = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
  }
}