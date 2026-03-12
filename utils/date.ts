/**
 * 日期工具函数
 */

/**
 * 格式化日期为 YYYY.MM.DD 格式
 * @param date Date对象，默认为当前时间
 * @returns string 格式化后的日期字符串
 */
export function formatDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * 格式化日期为中文格式
 * @param date Date对象，默认为当前时间
 * @returns string 如：2026年03月12日
 */
export function formatDateCN(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}年${month}月${day}日`;
}

/**
 * 获取当前时间戳
 * @returns number
 */
export function getTimestamp(): number {
  return Date.now();
}

/**
 * 获取本周的开始日期
 * @returns Date
 */
export function getWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  return new Date(now.setDate(diff));
}
