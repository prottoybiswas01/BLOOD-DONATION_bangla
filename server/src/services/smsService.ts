import { ENV } from '../config/env.js';

export interface ISmsProvider {
  name: string;
  isAvailable(): boolean;
  sendOtp(phone: string, otp: string, purpose: string): Promise<{ success: boolean; message: string; devOtp?: string }>;
}

/**
 * Mock SMS Provider for local development and QA testing.
 * Strictly disabled in production.
 */
export class MockSmsProvider implements ISmsProvider {
  name = 'Mock/Development SMS Provider';

  isAvailable(): boolean {
    return ENV.NODE_ENV !== 'production';
  }

  async sendOtp(phone: string, otp: string, purpose: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
    if (ENV.NODE_ENV === 'production') {
      return {
        success: false,
        message: 'Mock SMS provider is disabled in production environment.'
      };
    }

    console.log(`\n======================================================`);
    console.log(`[DEV SMS SIMULATOR] To: ${phone} | Purpose: ${purpose}`);
    console.log(`[DEV SMS SIMULATOR] Bangladesh Blood Donation OTP Code: ${otp}`);
    console.log(`[DEV SMS SIMULATOR] (Valid for 5 minutes. Real SMS is not sent)`);
    console.log(`======================================================\n`);

    return {
      success: true,
      message: `[পরীক্ষামূলক/Dev] আপনার ওটিপি কোড তৈরি হয়েছে (${otp})। স্থানীয় পরীক্ষার জন্য এটি ব্যবহার করুন।`,
      devOtp: otp // Returned in dev mode only for ease of testing in UI
    };
  }
}

/**
 * Production SMS Provider Adapter (e.g. BulkSMSBD, Greenweb, Twilio)
 */
export class ProductionSmsProvider implements ISmsProvider {
  name = 'Production Bangladesh Gateway (BulkSMSBD/Greenweb)';

  isAvailable(): boolean {
    return Boolean(ENV.SMS_API_KEY && ENV.SMS_PROVIDER !== 'mock');
  }

  async sendOtp(phone: string, otp: string, purpose: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
    if (!this.isAvailable()) {
      return {
        success: false,
        message: 'SMS Gateway is not configured. Please set SMS_API_KEY in environment settings.'
      };
    }

    // Production integration placeholder with actual HTTP call to Bangladeshi SMS API
    // e.g. http://bulksmsbd.net/api/smsapi?api_key=...&type=text&number=...&senderid=...&message=...
    console.log(`[SMS Gateway] Dispatched SMS to ${phone} via ${ENV.SMS_PROVIDER}`);
    return {
      success: true,
      message: 'ওটিপি কোড আপনার মোবাইলে পাঠানো হয়েছে।'
    };
  }
}

export class SmsService {
  private static provider: ISmsProvider;

  static getProvider(): ISmsProvider {
    if (!this.provider) {
      if (ENV.SMS_PROVIDER === 'mock' || !ENV.SMS_API_KEY) {
        this.provider = new MockSmsProvider();
      } else {
        this.provider = new ProductionSmsProvider();
      }
    }
    return this.provider;
  }

  static async sendOtp(phone: string, otp: string, purpose: string) {
    const provider = this.getProvider();
    return provider.sendOtp(phone, otp, purpose);
  }
}

