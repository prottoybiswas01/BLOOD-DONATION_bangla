import rateLimit from 'express-rate-limit';

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // max 300 requests per 15 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'অতিরিক্ত অনুরোধ পাঠানো হয়েছে। অনুগ্রহ করে ১৫ মিনিট পর পুনরায় চেষ্টা করুন।'
  }
});

export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // max 20 login/OTP attempts per 10 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'অতিরিক্ত লগইন বা ওটিপি অনুরোধ পাঠানো হয়েছে। অনুগ্রহ করে ১০ মিনিট অপেক্ষা করুন।'
  }
});

export const contactRevealRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // max 15 contact reveals per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'ঘন্টায় রক্তদাতার নম্বর দেখার সীমা অতিক্রম করেছে। ডেটা সুরক্ষা ও স্ক্র্যাপিং রোধে অনুগ্রহ করে কিছুক্ষণ পর চেষ্টা করুন।'
  }
});

