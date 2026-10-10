'use client';

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Globe,
  Eye,
  Users,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  Sparkles,
  ArrowUpRight,
  Flame,
  Layers,
  Calendar,
  Share2,
  Compass,
} from 'lucide-react';
import {
  TRAFFIC_DATA_7D,
  TRAFFIC_DATA_30D,
  TRAFFIC_DATA_12M,
  TRAFFIC_SOURCES_DATA,
  DEVICE_TRAFFIC_DATA,
  PEAK_HOURS_DATA,
  TrafficTimeframeData,
  TrafficPoint,
} from '@/lib/data/analyticsData';

type MetricFilter = 'all' | 'pageviews' | 'visitors';
type TimeframeKey = '7d' | '30d' | '12m';

export function TrafficAnalyticsSection() {
  const [timeframe, setTimeframe] = useState<TimeframeKey>('7d');
  const [metricFilter, setMetricFilter] = useState<MetricFilter>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const currentData: TrafficTimeframeData = useMemo(() => {
    switch (timeframe) {
      case '30d':
        return TRAFFIC_DATA_30D;
      case '12m':
        return TRAFFIC_DATA_12M;
      default:
        return TRAFFIC_DATA_7D;
    }
  }, [timeframe]);

  const points = currentData.points;

  // Chart Dimensions & Scales
  const svgWidth = 840;
  const svgHeight = 260;
  const paddingX = 45;
  const paddingTop = 30;
  const paddingBottom = 45;

  const innerWidth = svgWidth - paddingX * 2;
  const innerHeight = svgHeight - paddingTop - paddingBottom;

  // Compute maximum values for scaling
  const maxPageview = useMemo(() => {
    const maxVal = Math.max(...points.map((p) => p.pageviews), 100);
    // Round up to nice number
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
    return Math.ceil((maxVal * 1.15) / magnitude) * magnitude;
  }, [points]);

  const maxVisitor = useMemo(() => {
    const maxVal = Math.max(...points.map((p) => p.visitors), 50);
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
    return Math.ceil((maxVal * 1.15) / magnitude) * magnitude;
  }, [points]);

  // Coordinates helper
  const getCoordinates = (point: TrafficPoint, index: number) => {
    const step = innerWidth / (points.length - 1 || 1);
    const x = paddingX + index * step;
    const yViews = paddingTop + innerHeight - (point.pageviews / maxPageview) * innerHeight;
    const yVisitors = paddingTop + innerHeight - (point.visitors / maxVisitor) * innerHeight;
    return { x, yViews, yVisitors };
  };

  // Helper to generate SVG Bézier curve path
  const createSmoothPath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const current = coords[i];
      const next = coords[i + 1];
      const cpX1 = current.x + (next.x - current.x) / 2.4;
      const cpY1 = current.y;
      const cpX2 = next.x - (next.x - current.x) / 2.4;
      const cpY2 = next.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    return path;
  };

  const coordinates = useMemo(() => {
    return points.map((p, idx) => getCoordinates(p, idx));
  }, [points, maxPageview, maxVisitor]);

  const viewsPath = useMemo(() => {
    const pts = coordinates.map((c) => ({ x: c.x, y: c.yViews }));
    return createSmoothPath(pts);
  }, [coordinates]);

  const viewsAreaPath = useMemo(() => {
    if (coordinates.length === 0) return '';
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    const bottomY = paddingTop + innerHeight;
    return `${viewsPath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [viewsPath, coordinates]);

  const visitorsPath = useMemo(() => {
    const pts = coordinates.map((c) => ({ x: c.x, y: c.yVisitors }));
    return createSmoothPath(pts);
  }, [coordinates]);

  const visitorsAreaPath = useMemo(() => {
    if (coordinates.length === 0) return '';
    const first = coordinates[0];
    const last = coordinates[coordinates.length - 1];
    const bottomY = paddingTop + innerHeight;
    return `${visitorsPath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [visitorsPath, coordinates]);

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];
  const activeCoord = hoveredIndex !== null ? coordinates[hoveredIndex] : coordinates[coordinates.length - 1];

  // Grid tick lines
  const gridTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="space-y-6">
      {/* 4 Traffic KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Views */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between relative overflow-hidden group hover:border-orange-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Lượt Truy Cập Trang
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF5C28] flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {currentData.totalViews.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center gap-0.5 text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{currentData.growthViewsPercent}%
              </span>
              <span className="text-xs text-slate-400">so với kỳ trước</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-orange-500/5 rounded-full blur-xl group-hover:bg-orange-500/10 transition-colors" />
        </div>

        {/* Card 2: Unique Visitors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between relative overflow-hidden group hover:border-sky-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Khách Truy Cập (Unique)
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {currentData.totalVisitors.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center gap-0.5 text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{currentData.growthVisitorsPercent}%
              </span>
              <span className="text-xs text-slate-400">người học mới & quay lại</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-sky-500/5 rounded-full blur-xl group-hover:bg-sky-500/10 transition-colors" />
        </div>

        {/* Card 3: Avg Session Duration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between relative overflow-hidden group hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Thời Gian Phiên Học
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {currentData.avgSessionDuration}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center gap-0.5 text-xs font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Tích cực
              </span>
              <span className="text-xs text-slate-400">trung bình mỗi lượt học</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors" />
        </div>

        {/* Card 4: Peak Activity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between relative overflow-hidden group hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Thời Điểm Cao Điểm
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black text-amber-700 tracking-tight truncate" title={currentData.peakDay}>
              {currentData.peakDay}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-xs font-bold text-slate-600">
                20:00 - 22:30 hàng ngày
              </span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
        </div>
      </div>

      {/* Main Interactive Chart Box */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-5">
        {/* Chart Header with Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5C28] animate-ping" />
              <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FF5C28]" />
                <span>Biểu Đồ Lưu Lượng Truy Cập Website Thời Gian Thực</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Theo dõi lượt truy cập (Pageviews) và số lượng người học truy cập hệ thống (Unique Visitors)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Mode Toggle */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                onClick={() => setMetricFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  metricFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Tất Cả
              </button>
              <button
                onClick={() => setMetricFilter('pageviews')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  metricFilter === 'pageviews'
                    ? 'bg-white text-[#FF5C28] shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#FF5C28]" />
                <span>Lượt Xem</span>
              </button>
              <button
                onClick={() => setMetricFilter('visitors')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  metricFilter === 'visitors'
                    ? 'bg-white text-sky-600 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Người Học</span>
              </button>
            </div>

            {/* Timeframe Buttons */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                onClick={() => {
                  setTimeframe('7d');
                  setHoveredIndex(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeframe === '7d'
                    ? 'bg-[#FF5C28] text-white shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                7 Ngày
              </button>
              <button
                onClick={() => {
                  setTimeframe('30d');
                  setHoveredIndex(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeframe === '30d'
                    ? 'bg-[#FF5C28] text-white shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                30 Ngày
              </button>
              <button
                onClick={() => {
                  setTimeframe('12m');
                  setHoveredIndex(null);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeframe === '12m'
                    ? 'bg-[#FF5C28] text-white shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                12 Tháng
              </button>
            </div>
          </div>
        </div>

        {/* Legend & Hover Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/70 px-4 py-2.5 rounded-xl border border-slate-100">
          <div className="flex items-center gap-5">
            {(metricFilter === 'all' || metricFilter === 'pageviews') && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5C28] ring-2 ring-orange-200" />
                <span className="font-bold text-slate-700">Lượt Xem (Pageviews)</span>
                <span className="font-extrabold text-[#FF5C28]">
                  {activePoint ? activePoint.pageviews.toLocaleString() : ''}
                </span>
              </div>
            )}
            {(metricFilter === 'all' || metricFilter === 'visitors') && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-500 ring-2 ring-sky-200" />
                <span className="font-bold text-slate-700">Khách Truy Cập (Visitors)</span>
                <span className="font-extrabold text-sky-600">
                  {activePoint ? activePoint.visitors.toLocaleString() : ''}
                </span>
              </div>
            )}
          </div>

          <div className="text-slate-500 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">{activePoint?.label}</span>
            <span className="text-slate-300">|</span>
            <span>Tỷ lệ thoát: <b>{activePoint?.bounceRate}%</b></span>
          </div>
        </div>

        {/* SVG Interactive Canvas */}
        <div className="relative w-full overflow-x-auto select-none pt-2">
          <div className="min-w-[680px]">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible cursor-crosshair"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <defs>
                {/* Pageviews Gradient */}
                <linearGradient id="gradient-pageviews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5C28" stopOpacity="0.35" />
                  <stop offset="85%" stopColor="#FF5C28" stopOpacity="0.03" />
                  <stop offset="100%" stopColor="#FF5C28" stopOpacity="0.0" />
                </linearGradient>

                {/* Visitors Gradient */}
                <linearGradient id="gradient-visitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284C7" stopOpacity="0.30" />
                  <stop offset="85%" stopColor="#0284C7" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
                </linearGradient>

                {/* Filter Shadow */}
                <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#FF5C28" floodOpacity="0.4" />
                </filter>
                <filter id="glow-sky" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0284C7" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Horizontal Grid lines */}
              {gridTicks.map((ratio) => {
                const y = paddingTop + innerHeight * (1 - ratio);
                const valueLabel = Math.round(maxPageview * ratio);
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeDasharray={ratio === 0 ? '0' : '4 4'}
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="10"
                      fontWeight="600"
                      fill="#94A3B8"
                    >
                      {valueLabel >= 1000 ? `${(valueLabel / 1000).toFixed(0)}k` : valueLabel}
                    </text>
                  </g>
                );
              })}

              {/* Area Fills */}
              {(metricFilter === 'all' || metricFilter === 'pageviews') && (
                <path d={viewsAreaPath} fill="url(#gradient-pageviews)" />
              )}
              {(metricFilter === 'all' || metricFilter === 'visitors') && (
                <path d={visitorsAreaPath} fill="url(#gradient-visitors)" />
              )}

              {/* Spline Lines */}
              {(metricFilter === 'all' || metricFilter === 'pageviews') && (
                <path
                  d={viewsPath}
                  fill="none"
                  stroke="#FF5C28"
                  strokeWidth="3"
                  strokeLinecap="round"
                  filter="url(#glow-orange)"
                />
              )}
              {(metricFilter === 'all' || metricFilter === 'visitors') && (
                <path
                  d={visitorsPath}
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={metricFilter === 'all' ? '5 3' : '0'}
                  filter="url(#glow-sky)"
                />
              )}

              {/* Interactive Vertical Crosshair Line */}
              {hoveredIndex !== null && activeCoord && (
                <g>
                  <line
                    x1={activeCoord.x}
                    y1={paddingTop - 10}
                    x2={activeCoord.x}
                    y2={paddingTop + innerHeight}
                    stroke="#FF5C28"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    opacity="0.8"
                  />
                </g>
              )}

              {/* Interactive Hover Circles and Click Targets */}
              {coordinates.map((coord, idx) => {
                const isHovered = hoveredIndex === idx;
                const point = points[idx];
                return (
                  <g
                    key={idx}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    className="cursor-pointer"
                  >
                    {/* Big transparent hit area */}
                    <rect
                      x={coord.x - (innerWidth / points.length) / 2}
                      y={0}
                      width={innerWidth / points.length}
                      height={svgHeight}
                      fill="transparent"
                    />

                    {/* Pageviews Point */}
                    {(metricFilter === 'all' || metricFilter === 'pageviews') && (
                      <g>
                        {isHovered && (
                          <circle
                            cx={coord.x}
                            cy={coord.yViews}
                            r="9"
                            fill="#FF5C28"
                            opacity="0.25"
                            className="animate-pulse"
                          />
                        )}
                        <circle
                          cx={coord.x}
                          cy={coord.yViews}
                          r={isHovered ? '6' : '3.5'}
                          fill="#FFFFFF"
                          stroke="#FF5C28"
                          strokeWidth={isHovered ? '3' : '2'}
                          className="transition-all duration-150"
                        />
                      </g>
                    )}

                    {/* Visitors Point */}
                    {(metricFilter === 'all' || metricFilter === 'visitors') && (
                      <g>
                        {isHovered && (
                          <circle
                            cx={coord.x}
                            cy={coord.yVisitors}
                            r="8"
                            fill="#0284C7"
                            opacity="0.25"
                          />
                        )}
                        <circle
                          cx={coord.x}
                          cy={coord.yVisitors}
                          r={isHovered ? '5' : '3'}
                          fill="#FFFFFF"
                          stroke="#0284C7"
                          strokeWidth="2"
                          className="transition-all duration-150"
                        />
                      </g>
                    )}

                    {/* X-Axis Labels */}
                    <text
                      x={coord.x}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight={isHovered ? '800' : '600'}
                      fill={isHovered ? '#0F172A' : '#64748B'}
                      className="transition-colors"
                    >
                      {point.shortLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* 3 Secondary Traffic Analytics Panels: Sources, Devices, Peak Hours */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Panel 1: Traffic Sources */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#FF5C28]" />
              <span>Nguồn Lưu Lượng Truy Cập</span>
            </h4>
            <span className="text-[11px] font-extrabold text-slate-400">100%</span>
          </div>

          <div className="space-y-3.5">
            {TRAFFIC_SOURCES_DATA.map((source) => (
              <div key={source.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: source.color }}
                    />
                    <span className="font-bold text-slate-800 truncate" title={source.name}>
                      {source.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-black text-slate-900">{source.percentage}%</span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      +{source.growth}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${source.percentage}%`,
                      backgroundColor: source.color,
                    }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 pl-4.5">
                  {source.count.toLocaleString()} lượt truy cập
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: Device Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-sky-600" />
              <span>Thiết Bị Người Dùng</span>
            </h4>
            <span className="text-[11px] font-bold text-slate-400">Mobile First</span>
          </div>

          <div className="space-y-3">
            {DEVICE_TRAFFIC_DATA.map((dev) => {
              const Icon =
                dev.icon === 'Smartphone'
                  ? Smartphone
                  : dev.icon === 'Monitor'
                  ? Monitor
                  : Tablet;
              return (
                <div
                  key={dev.device}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: dev.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">{dev.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {dev.count.toLocaleString()} lượt
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-slate-900">
                      {dev.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/50 text-xs text-amber-900">
            💡 <b>56%</b> người học truy cập qua di động. Giao diện flashcard và bài tập hiện đã tối ưu cảm ứng di động hoàn hảo.
          </div>
        </div>

        {/* Panel 3: Peak Hours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>Khung Giờ Học Nhiều Nhất</span>
            </h4>
            <span className="text-[11px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Đỉnh: 20h - 22h
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Lưu lượng học viên làm bài tập và luyện từ vựng theo các mốc thời gian trong ngày:
          </p>

          <div className="space-y-2 pt-1">
            {PEAK_HOURS_DATA.map((slot) => (
              <div key={slot.hour} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-700 w-11">{slot.hour}</span>
                    <span className="text-[11px] text-slate-400">{slot.label}</span>
                  </div>
                  <span className="font-extrabold text-slate-800">
                    {slot.views.toLocaleString()} lượt
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      slot.activityPercent > 80
                        ? 'bg-[#FF5C28]'
                        : slot.activityPercent > 60
                        ? 'bg-amber-500'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${slot.activityPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
