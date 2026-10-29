import React from 'react';
import { AlertCircle } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-center gap-2">
      <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
      <span>
        <strong>পরীক্ষামূলক ডেটা / Demonstration Platform:</strong> এটি একটি সম্পূর্ণ কার্যকরী রক্তদান সমন্বয় ব্যবস্থার ডেমো সংস্করণ। প্রদর্শিত রেকর্ডসমূহ নমুনা তথ্য।
      </span>
    </div>
  );
};

