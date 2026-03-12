/**
 * 错误处理工具
 * 统一处理小程序中的错误和提示
 */

import { ERROR_MESSAGES } from '../constants/index';

/**
 * 错误类型枚举
 */
export enum ErrorType {
  /** 用户取消 */
  CANCEL = 'cancel',
  /** 权限拒绝 */
  PERMISSION_DENIED = 'permission_denied',
  /** 网络错误 */
  NETWORK = 'network',
  /** Canvas错误 */
  CANVAS = 'canvas',
  /** 图片错误 */
  IMAGE = 'image',
  /** 存储错误 */
  STORAGE = 'storage',
  /** 未知错误 */
  UNKNOWN = 'unknown'
}

/**
 * 解析错误类型
 * @param error 错误对象或字符串
 * @returns ErrorType
 */
function parseErrorType(error: any): ErrorType {
  const errMsg = error?.errMsg || error?.message || String(error);

  if (errMsg.includes('cancel')) {
    return ErrorType.CANCEL;
  }
  if (errMsg.includes('auth') || errMsg.includes('permission')) {
    return ErrorType.PERMISSION_DENIED;
  }
  if (errMsg.includes('network') || errMsg.includes('timeout')) {
    return ErrorType.NETWORK;
  }
  if (errMsg.includes('canvas') || errMsg.includes('Canvas')) {
    return ErrorType.CANVAS;
  }
  if (errMsg.includes('image') || errMsg.includes('Image')) {
    return ErrorType.IMAGE;
  }
  if (errMsg.includes('storage') || errMsg.includes('Storage')) {
    return ErrorType.STORAGE;
  }

  return ErrorType.UNKNOWN;
}

/**
 * 获取错误提示消息
 * @param type 错误类型
 * @param customMessage 自定义消息
 * @returns string
 */
function getErrorMessage(type: ErrorType, customMessage?: string): string {
  if (customMessage) return customMessage;

  switch (type) {
    case ErrorType.CANCEL:
      return '已取消操作';
    case ErrorType.PERMISSION_DENIED:
      return '需要授权才能继续';
    case ErrorType.NETWORK:
      return '网络连接异常，请检查网络';
    case ErrorType.CANVAS:
      return ERROR_MESSAGES.canvasError;
    case ErrorType.IMAGE:
      return '图片处理失败，请重试';
    case ErrorType.STORAGE:
      return '数据保存失败';
    default:
      return '操作失败，请重试';
  }
}

/**
 * 统一错误处理
 * @param error 错误对象
 * @param context 错误上下文（用于日志）
 * @param options 配置选项
 */
export function handleError(
  error: any,
  context: string,
  options?: {
    /** 是否显示Toast */
    showToast?: boolean;
    /** 自定义错误消息 */
    customMessage?: string;
    /** 是否上报日志 */
    report?: boolean;
  }
): void {
  const { showToast = true, customMessage, report = false } = options || {};

  // 解析错误类型
  const errorType = parseErrorType(error);

  // 打印错误日志
  console.error(`[${context}] ${errorType}:`, error);

  // 用户取消不显示错误提示
  if (errorType === ErrorType.CANCEL) {
    return;
  }

  // 显示错误提示
  if (showToast) {
    const message = getErrorMessage(errorType, customMessage);
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  }

  // 上报错误（如果需要）
  if (report) {
    // TODO: 接入日志上报系统
    console.log('Error reported:', { context, errorType, error });
  }
}

/**
 * 包装异步函数，自动处理错误
 * @param fn 异步函数
 * @param context 错误上下文
 * @param errorHandler 自定义错误处理
 * @returns Promise<T | null>
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  context: string,
  errorHandler?: (error: any) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      handleError(error, context);
    }
    return null;
  }
}

/**
 * 显示成功提示
 * @param message 消息内容
 * @param duration 显示时长（毫秒）
 */
export function showSuccess(message: string, duration: number = 1500): void {
  wx.showToast({
    title: message,
    icon: 'success',
    duration
  });
}

/**
 * 显示加载中
 * @param message 消息内容
 * @param mask 是否显示遮罩
 * @returns 关闭函数
 */
export function showLoading(message: string = '加载中...', mask: boolean = true): () => void {
  wx.showLoading({ title: message, mask });
  return () => wx.hideLoading();
}

/**
 * 显示确认对话框
 * @param options 配置选项
 * @returns Promise<boolean>
 */
export function showConfirm(options: {
  title?: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
}): Promise<boolean> {
  return new Promise((resolve) => {
    wx.showModal({
      title: options.title || '提示',
      content: options.content,
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      success: (res) => resolve(res.confirm)
    });
  });
}
