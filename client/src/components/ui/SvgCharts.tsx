import React from 'react';

// 1. Blood Group Distribution Bar Chart
export interface BloodGroupItem {
  group: string;
  count: number;
}

export const BloodGroupBarChart: React.FC<{ data: BloodGroupItem[]; title?: string }> = ({ data, title }) => {
  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-surface rounded-2xl border border-appBorder p-5 shadow-soft">
      {title && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-appBorder">
          <h4 className="font-bold text-mainText text-sm sm:text-base">{title}</h4>
          <span className="text-xs text-subText">সর্বমোট: {data.reduce((a, b) => a + b.count, 0)} জন</span>
        </div>
      )}
      <div className="space-y-3">
        {data.map((item) => {
          const pct = Math.round((item.count / max) * 100);
          return (
            <div key={item.group} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-mainText">
                  <span className="w-6 h-6 rounded-md bg-red-50 text-primary text-[11px] font-extrabold flex items-center justify-center border border-red-100">
                    {item.group}
                  </span>
                  <span>{item.group} রক্তদাতা</span>
                </span>
                <span className="text-subText font-mono font-medium">
                  {item.count} জন ({pct}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-primary rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(pct, 4)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 2. Trend Area Chart (Monthly Registration / Request Trends)
export interface TrendPoint {
  label: string;
  value: number;
}

export const TrendLineChart: React.FC<{ 
  data: TrendPoint[]; 
  title: string; 
  subtitle?: string;
  color?: string;
}> = ({ data, title, subtitle, color = '#C62828' }) => {
  if (!data || data.length === 0) return null;

  const width = 600;
  const height = 200;
  const padding = 35;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const maxVal = Math.max(...data.map(d => d.value), 5);
  const minVal = 0;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * innerWidth;
    const y = height - padding - ((d.value - minVal) / (maxVal - minVal)) * innerHeight;
    return { x, y, label: d.label, value: d.value };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="bg-surface rounded-2xl border border-appBorder p-5 shadow-soft">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-appBorder">
        <div>
          <h4 className="font-bold text-mainText text-sm sm:text-base">{title}</h4>
          {subtitle && <p className="text-xs text-subText mt-0.5">{subtitle}</p>}
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-primary border border-red-100">
          সর্বশেষ ৬ মাস
        </span>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 sm:h-56">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#E2E8F0" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#E2E8F0" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#CBD5E1" />

          {/* Area Fill */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g key={idx} className="group">
              <circle 
                cx={pt.x} 
                cy={pt.y} 
                r="4.5" 
                fill="#FFFFFF" 
                stroke={color} 
                strokeWidth="2.5" 
                className="transition-transform group-hover:scale-125"
              />
              <text 
                x={pt.x} 
                y={height - 12} 
                textAnchor="middle" 
                fill="#64748B" 
                fontSize="11" 
                fontWeight="500"
              >
                {pt.label}
              </text>
              <text 
                x={pt.x} 
                y={pt.y - 10} 
                textAnchor="middle" 
                fill="#1F2937" 
                fontSize="11" 
                fontWeight="700"
              >
                {pt.value}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

// 3. Status Donut / Ring Chart
export interface StatusSlice {
  label: string;
  value: number;
  color: string;
}

export const StatusDonutChart: React.FC<{ slices: StatusSlice[]; title: string }> = ({ slices, title }) => {
  const total = slices.reduce((acc, s) => acc + s.value, 0) || 1;
  const size = 160;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className="bg-surface rounded-2xl border border-appBorder p-5 shadow-soft">
      <h4 className="font-bold text-mainText text-sm sm:text-base mb-4 pb-3 border-b border-appBorder">
        {title}
      </h4>
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />
            {slices.map((slice, i) => {
              const strokeDasharray = `${(slice.value / total) * circumference} ${circumference}`;
              const strokeDashoffset = -currentOffset;
              currentOffset += (slice.value / total) * circumference;

              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              );
            })}
          </svg>
          <div className="absolute text-center">
            <span className="block text-2xl font-black text-mainText">{total}</span>
            <span className="text-[10px] text-subText font-medium uppercase tracking-wider">সর্বমোট</span>
          </div>
        </div>

        <div className="space-y-2 w-full sm:w-auto">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
                <span className="text-mainText font-medium">{slice.label}</span>
              </div>
              <span className="font-mono font-bold text-mainText">
                {slice.value} ({Math.round((slice.value / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

