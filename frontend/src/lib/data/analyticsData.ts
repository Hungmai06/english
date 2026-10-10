export interface TrafficPoint {
  label: string;
  shortLabel: string;
  pageviews: number;
  visitors: number;
  avgMinutes: number;
  bounceRate: number;
}

export interface TrafficTimeframeData {
  timeframe: '7d' | '30d' | '12m';
  title: string;
  totalViews: number;
  totalVisitors: number;
  growthViewsPercent: number;
  growthVisitorsPercent: number;
  avgSessionDuration: string;
  peakDay: string;
  points: TrafficPoint[];
}

export interface TrafficSource {
  id: string;
  name: string;
  category: string;
  count: number;
  percentage: number;
  growth: number;
  color: string;
  bgLight: string;
}

export interface DeviceTraffic {
  device: string;
  name: string;
  count: number;
  percentage: number;
  icon: 'Smartphone' | 'Monitor' | 'Tablet';
  color: string;
}

export interface PeakHourTraffic {
  hour: string;
  activityPercent: number;
  views: number;
  label: string;
}

export interface TopLearnedWord {
  id: string;
  lemma: string;
  ipa: string;
  pos: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  definition: string;
  viewsCount: number;
  practicedCount: number;
  masteryRate: number; // percentage
  savedCount: number;
}

export interface TopGrammarLessonStat {
  id: string;
  title: string;
  topicTitle: string;
  level: string;
  completionsCount: number;
  avgScore: number; // e.g. 94%
  estimatedMinutes: string;
}

export interface TopQuestionTypeStat {
  type: string;
  name: string;
  count: number;
  percentage: number;
  avgAccuracy: number;
  color: string;
}

export interface HardestQuestionStat {
  id: string;
  prompt: string;
  category: string;
  level: string;
  incorrectRate: number; // e.g. 52%
  attemptsCount: number;
  correctAnswer: string;
}

// 7 Days Data (Daily)
export const TRAFFIC_DATA_7D: TrafficTimeframeData = {
  timeframe: '7d',
  title: '7 ngày qua',
  totalViews: 45790,
  totalVisitors: 11020,
  growthViewsPercent: 18.4,
  growthVisitorsPercent: 14.2,
  avgSessionDuration: '5m 12s',
  peakDay: 'Thứ Bảy (8,950 lượt)',
  points: [
    { label: 'Thứ Hai, 28/09', shortLabel: 'T2', pageviews: 4820, visitors: 1350, avgMinutes: 4.2, bounceRate: 24.1 },
    { label: 'Thứ Ba, 29/09', shortLabel: 'T3', pageviews: 5630, visitors: 1580, avgMinutes: 4.6, bounceRate: 23.5 },
    { label: 'Thứ Tư, 30/09', shortLabel: 'T4', pageviews: 6120, visitors: 1720, avgMinutes: 4.9, bounceRate: 22.8 },
    { label: 'Thứ Năm, 01/10', shortLabel: 'T5', pageviews: 5890, visitors: 1640, avgMinutes: 4.4, bounceRate: 24.0 },
    { label: 'Thứ Sáu, 02/10', shortLabel: 'T6', pageviews: 7240, visitors: 2040, avgMinutes: 5.3, bounceRate: 21.6 },
    { label: 'Thứ Bảy, 03/10', shortLabel: 'T7', pageviews: 8950, visitors: 2510, avgMinutes: 5.9, bounceRate: 19.8 },
    { label: 'Chủ Nhật, 04/10', shortLabel: 'CN', pageviews: 7140, visitors: 2180, avgMinutes: 5.4, bounceRate: 20.4 },
  ],
};

// 30 Days Data (Weekly segments)
export const TRAFFIC_DATA_30D: TrafficTimeframeData = {
  timeframe: '30d',
  title: '30 ngày qua',
  totalViews: 178450,
  totalVisitors: 41200,
  growthViewsPercent: 22.8,
  growthVisitorsPercent: 17.5,
  avgSessionDuration: '4m 58s',
  peakDay: 'Tuần 3 (48,320 lượt)',
  points: [
    { label: 'Ngày 01-03', shortLabel: '01-03', pageviews: 14800, visitors: 3750, avgMinutes: 4.5, bounceRate: 23.8 },
    { label: 'Ngày 04-06', shortLabel: '04-06', pageviews: 16200, visitors: 4100, avgMinutes: 4.7, bounceRate: 23.0 },
    { label: 'Ngày 07-09', shortLabel: '07-09', pageviews: 17400, visitors: 4350, avgMinutes: 4.8, bounceRate: 22.4 },
    { label: 'Ngày 10-12', shortLabel: '10-12', pageviews: 15900, visitors: 3980, avgMinutes: 4.6, bounceRate: 23.2 },
    { label: 'Ngày 13-15', shortLabel: '13-15', pageviews: 18600, visitors: 4620, avgMinutes: 5.1, bounceRate: 21.5 },
    { label: 'Ngày 16-18', shortLabel: '16-18', pageviews: 20400, visitors: 5120, avgMinutes: 5.3, bounceRate: 20.8 },
    { label: 'Ngày 19-21', shortLabel: '19-21', pageviews: 19200, visitors: 4890, avgMinutes: 5.0, bounceRate: 21.2 },
    { label: 'Ngày 22-24', shortLabel: '22-24', pageviews: 21500, visitors: 5410, avgMinutes: 5.4, bounceRate: 20.1 },
    { label: 'Ngày 25-27', shortLabel: '25-27', pageviews: 22100, visitors: 5650, avgMinutes: 5.5, bounceRate: 19.7 },
    { label: 'Ngày 28-30', shortLabel: '28-30', pageviews: 21850, visitors: 5530, avgMinutes: 5.2, bounceRate: 20.3 },
  ],
};

// 12 Months Data (Monthly)
export const TRAFFIC_DATA_12M: TrafficTimeframeData = {
  timeframe: '12m',
  title: '12 tháng qua',
  totalViews: 1485600,
  totalVisitors: 362400,
  growthViewsPercent: 64.2,
  growthVisitorsPercent: 58.0,
  avgSessionDuration: '4m 45s',
  peakDay: 'Tháng 9 (168,400 lượt)',
  points: [
    { label: 'Tháng 11/2025', shortLabel: 'T11', pageviews: 78000, visitors: 19500, avgMinutes: 3.8, bounceRate: 28.5 },
    { label: 'Tháng 12/2025', shortLabel: 'T12', pageviews: 89000, visitors: 22400, avgMinutes: 4.0, bounceRate: 27.2 },
    { label: 'Tháng 01/2026', shortLabel: 'T01', pageviews: 104000, visitors: 26800, avgMinutes: 4.2, bounceRate: 26.0 },
    { label: 'Tháng 02/2026', shortLabel: 'T02', pageviews: 96000, visitors: 24200, avgMinutes: 4.1, bounceRate: 26.8 },
    { label: 'Tháng 03/2026', shortLabel: 'T03', pageviews: 115000, visitors: 29100, avgMinutes: 4.4, bounceRate: 25.1 },
    { label: 'Tháng 04/2026', shortLabel: 'T04', pageviews: 128000, visitors: 32400, avgMinutes: 4.6, bounceRate: 24.3 },
    { label: 'Tháng 05/2026', shortLabel: 'T05', pageviews: 136000, visitors: 34500, avgMinutes: 4.7, bounceRate: 23.5 },
    { label: 'Tháng 06/2026', shortLabel: 'T06', pageviews: 142000, visitors: 35800, avgMinutes: 4.8, bounceRate: 22.9 },
    { label: 'Tháng 07/2026', shortLabel: 'T07', pageviews: 151000, visitors: 38200, avgMinutes: 5.0, bounceRate: 22.0 },
    { label: 'Tháng 08/2026', shortLabel: 'T08', pageviews: 159000, visitors: 40100, avgMinutes: 5.1, bounceRate: 21.4 },
    { label: 'Tháng 09/2026', shortLabel: 'T09', pageviews: 168400, visitors: 42600, avgMinutes: 5.3, bounceRate: 20.8 },
    { label: 'Tháng 10/2026', shortLabel: 'T10', pageviews: 162200, visitors: 41200, avgMinutes: 5.2, bounceRate: 21.1 },
  ],
};

// Traffic sources
export const TRAFFIC_SOURCES_DATA: TrafficSource[] = [
  {
    id: 'src-organic',
    name: 'Tìm kiếm Tự Nhiên (Google SEO)',
    category: 'Search Engine',
    count: 68420,
    percentage: 46.2,
    growth: 21.5,
    color: '#FF5C28',
    bgLight: 'bg-orange-500',
  },
  {
    id: 'src-direct',
    name: 'Truy Cập Trực Tiếp (Direct URL/Bookmarks)',
    category: 'Direct Traffic',
    count: 41530,
    percentage: 28.0,
    growth: 14.8,
    color: '#0284C7',
    bgLight: 'bg-sky-500',
  },
  {
    id: 'src-social',
    name: 'Mạng Xã Hội (Facebook, TikTok, YouTube)',
    category: 'Social Channels',
    count: 26680,
    percentage: 18.0,
    growth: 32.1,
    color: '#8B5CF6',
    bgLight: 'bg-purple-500',
  },
  {
    id: 'src-referral',
    name: 'Giới Thiệu & Diễn Đàn Học Tiếng Anh',
    category: 'Referral & Partner',
    count: 11620,
    percentage: 7.8,
    growth: 9.4,
    color: '#10B981',
    bgLight: 'bg-emerald-500',
  },
];

// Device distribution
export const DEVICE_TRAFFIC_DATA: DeviceTraffic[] = [
  {
    device: 'Mobile',
    name: 'Điện Thoại Di Động',
    count: 83020,
    percentage: 56,
    icon: 'Smartphone',
    color: '#FF5C28',
  },
  {
    device: 'Desktop',
    name: 'Máy Tính Để Bàn / Laptop',
    count: 56335,
    percentage: 38,
    icon: 'Monitor',
    color: '#0284C7',
  },
  {
    device: 'Tablet',
    name: 'Máy Tính Bảng (iPad/Tablet)',
    count: 8895,
    percentage: 6,
    icon: 'Tablet',
    color: '#8B5CF6',
  },
];

// Peak traffic hours in a day
export const PEAK_HOURS_DATA: PeakHourTraffic[] = [
  { hour: '06:00', activityPercent: 32, views: 2450, label: 'Sáng sớm ôn tập' },
  { hour: '09:00', activityPercent: 58, views: 4890, label: 'Giờ học sinh/sinh viên' },
  { hour: '12:00', activityPercent: 68, views: 5620, label: 'Nghỉ trưa học nhanh' },
  { hour: '15:00', activityPercent: 62, views: 5120, label: 'Buổi chiều luyện thi' },
  { hour: '18:00', activityPercent: 74, views: 6450, label: 'Sau giờ làm/học' },
  { hour: '20:00', activityPercent: 98, views: 8940, label: 'Cao điểm buổi tối' },
  { hour: '21:30', activityPercent: 95, views: 8680, label: 'Đỉnh điểm streak' },
  { hour: '23:00', activityPercent: 44, views: 3620, label: 'Đêm muộn' },
];

// Top 5 Most Learned Vocabulary Words
export const TOP_LEARNED_WORDS: TopLearnedWord[] = [
  {
    id: 'w-1',
    lemma: 'resilient',
    ipa: '/rɪˈzɪliənt/',
    pos: 'adjective',
    level: 'B2',
    definition: 'Khả năng phục hồi nhanh chóng từ khó khăn; kiên cường.',
    viewsCount: 4280,
    practicedCount: 3120,
    masteryRate: 91,
    savedCount: 680,
  },
  {
    id: 'w-2',
    lemma: 'meticulous',
    ipa: '/məˈtɪkjələs/',
    pos: 'adjective',
    level: 'C1',
    definition: 'Cực kỳ cẩn thận, tỉ mỉ, chú ý đến từng chi tiết nhỏ nhất.',
    viewsCount: 3890,
    practicedCount: 2840,
    masteryRate: 85,
    savedCount: 540,
  },
  {
    id: 'w-3',
    lemma: 'eloquent',
    ipa: '/ˈeləkwənt/',
    pos: 'adjective',
    level: 'C1',
    definition: 'Có tài hùng biện, diễn đạt ý kiến lưu loát và thuyết phục.',
    viewsCount: 3410,
    practicedCount: 2490,
    masteryRate: 78,
    savedCount: 490,
  },
  {
    id: 'w-4',
    lemma: 'ubiquitous',
    ipa: '/juːˈbɪkwɪtəs/',
    pos: 'adjective',
    level: 'C1',
    definition: 'Có mặt ở khắp mọi nơi, rất phổ biến.',
    viewsCount: 2980,
    practicedCount: 2150,
    masteryRate: 74,
    savedCount: 410,
  },
  {
    id: 'w-5',
    lemma: 'ephemeral',
    ipa: '/ɪˈfemərəl/',
    pos: 'adjective',
    level: 'C2',
    definition: 'Chỉ tồn tại trong một thời gian rất ngắn; phù du, chóng tàn.',
    viewsCount: 2460,
    practicedCount: 1820,
    masteryRate: 69,
    savedCount: 350,
  },
];

// Top Grammar Lessons Completed
export const TOP_GRAMMAR_LESSONS: TopGrammarLessonStat[] = [
  {
    id: 'ps-1',
    title: 'Hiện Tại Đơn (Present Simple): Chân lý & Thói quen',
    topicTitle: 'Các Thì Hiện Tại',
    level: 'A1',
    completionsCount: 2450,
    avgScore: 94,
    estimatedMinutes: '6 phút',
  },
  {
    id: 'cond-1',
    title: 'Câu Điều Kiện Loại 1 & 2: Khả năng & Giả định',
    topicTitle: 'Câu Điều Kiện',
    level: 'B1',
    completionsCount: 2120,
    avgScore: 89,
    estimatedMinutes: '8 phút',
  },
  {
    id: 'past-1',
    title: 'Quá Khứ Đơn (Past Simple): Sự kiện chấm dứt',
    topicTitle: 'Các Thì Quá Khứ',
    level: 'A2',
    completionsCount: 1890,
    avgScore: 92,
    estimatedMinutes: '8 phút',
  },
  {
    id: 'rc-1',
    title: 'Mệnh Đề Quan Hệ Xác Định & Không Xác Định',
    topicTitle: 'Mệnh Đề Quan Hệ',
    level: 'B2',
    completionsCount: 1640,
    avgScore: 83,
    estimatedMinutes: '11 phút',
  },
  {
    id: 'pass-1',
    title: 'Thể Bị Động (Passive Voice): Nhấn mạnh đối tượng',
    topicTitle: 'Thể Bị Động',
    level: 'B1',
    completionsCount: 1390,
    avgScore: 86,
    estimatedMinutes: '9 phút',
  },
];

// Top Question Types Practice Breakdown
export const TOP_QUESTION_TYPES: TopQuestionTypeStat[] = [
  {
    type: 'multiple_choice',
    name: 'Trắc nghiệm chọn đáp án đúng',
    count: 8420,
    percentage: 42,
    avgAccuracy: 78,
    color: '#FF5C28',
  },
  {
    type: 'toeic_part5',
    name: 'Luyện đề TOEIC Part 5 & 6',
    count: 4890,
    percentage: 24,
    avgAccuracy: 71,
    color: '#8B5CF6',
  },
  {
    type: 'fill_in_blank',
    name: 'Điền từ / Dạng đúng của từ',
    count: 3650,
    percentage: 18,
    avgAccuracy: 69,
    color: '#0284C7',
  },
  {
    type: 'word_matching',
    name: 'Nối từ vựng với định nghĩa',
    count: 2140,
    percentage: 11,
    avgAccuracy: 88,
    color: '#10B981',
  },
  {
    type: 'sentence_correction',
    name: 'Tìm lỗi sai trong câu',
    count: 1020,
    percentage: 5,
    avgAccuracy: 62,
    color: '#F59E0B',
  },
];

// Hardest questions with highest error rates
export const HARDEST_QUESTIONS: HardestQuestionStat[] = [
  {
    id: 'q-toeic-2',
    prompt: 'The Board concluded that the proposal was _____ lucrative than previously projected.',
    category: 'TOEIC Part 5',
    level: 'B2',
    incorrectRate: 58,
    attemptsCount: 1240,
    correctAnswer: 'substantially more',
  },
  {
    id: 'q-gram-4',
    prompt: 'Had he arrived five minutes earlier, he _____ the CEO before the meeting started.',
    category: 'Câu điều kiện đảo ngữ',
    level: 'C1',
    incorrectRate: 52,
    attemptsCount: 980,
    correctAnswer: 'would have met',
  },
  {
    id: 'q-voc-3',
    prompt: 'The speaker gave an _____ explanation that left no room for doubt or confusion.',
    category: 'Từ vựng C1 Collocation',
    level: 'C1',
    incorrectRate: 46,
    attemptsCount: 890,
    correctAnswer: 'unequivocal',
  },
  {
    id: 'q-gram-2',
    prompt: 'Neither the manager nor his assistants _____ informed about the schedule revision.',
    category: 'Hòa hợp Chủ ngữ - Động từ',
    level: 'B1',
    incorrectRate: 41,
    attemptsCount: 1450,
    correctAnswer: 'were',
  },
];
