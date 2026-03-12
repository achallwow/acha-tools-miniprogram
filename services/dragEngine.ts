/**
 * 拖拽引擎服务
 * 处理九宫格图片的拖拽排序逻辑
 */

import { DRAG_CONFIG, GRID_CONFIG } from '../constants/index';
import type { GridItem, DragState, DragEventData } from '../types/index';

/**
 * 计算两点之间的距离
 */
function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * 检测点是否在矩形内
 */
function isPointInRect(
  x: number,
  y: number,
  rect: WechatMiniprogram.BoundingClientRectCallbackResult
): boolean {
  return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;
}

/**
 * 判断拖拽是否已达到启动阈值
 * @param startX 起始X坐标
 * @param startY 起始Y坐标
 * @param currentX 当前X坐标
 * @param currentY 当前Y坐标
 * @returns boolean
 */
export function hasDragStarted(
  startX: number,
  startY: number,
  currentX: number,
  currentY: number
): boolean {
  const distance = calculateDistance(startX, startY, currentX, currentY);
  return distance > DRAG_CONFIG.startThreshold;
}

/**
 * 计算幽灵元素位置
 * @param clientX 触摸点X坐标
 * @param clientY 触摸点Y坐标
 * @returns { x: number, y: number }
 */
export function calculateGhostPosition(
  clientX: number,
  clientY: number
): { x: number; y: number } {
  const offset = DRAG_CONFIG.ghostSize;
  return {
    x: clientX - offset,
    y: clientY - offset
  };
}

/**
 * 检测碰撞并计算位置交换（优化版，带缓存）
 * @param touchX 触摸点X
 * @param touchY 触摸点Y
 * @param draggingIndex 当前拖拽项索引
 * @param gridItems 网格项数组
 * @param slotRects 格子位置信息
 * @param lastSwapSlot 上次交换的位置（用于优化）
 * @returns 更新后的网格项数组，如果没有碰撞返回null
 */
export function detectCollisionAndSwap(
  touchX: number,
  touchY: number,
  draggingIndex: number,
  gridItems: GridItem[],
  slotRects: WechatMiniprogram.BoundingClientRectCallbackResult[],
  lastSwapSlot: number = -1
): GridItem[] | null {
  if (slotRects.length < 9) return null;

  // 获取当前拖拽项所在的格子编号
  const currentSlotIndex = gridItems[draggingIndex].slot;

  // 优先检测当前拖拽项周围的格子（减少遍历次数）
  // 按照距离中心点的距离排序检测
  const checkOrder = [0, 1, 2, 3, 5, 6, 7, 8]; // 排除Logo位置4

  for (const i of checkOrder) {
    // 跳过当前位置
    if (i === currentSlotIndex) continue;

    // 跳过上次交换的位置（避免抖动）
    if (i === lastSwapSlot) continue;

    const rect = slotRects[i];
    if (!rect) continue;

    // 碰撞检测：手指是否进入格子
    // 使用中心点判断更准确
    const centerX = (rect.left + rect.right) / 2;
    const centerY = (rect.top + rect.bottom) / 2;
    const halfWidth = (rect.right - rect.left) / 2;
    const halfHeight = (rect.bottom - rect.top) / 2;

    // 判断触摸点是否在格子中心区域（50%范围内，更灵敏）
    const inCenterX = Math.abs(touchX - centerX) < halfWidth * 0.8;
    const inCenterY = Math.abs(touchY - centerY) < halfHeight * 0.8;

    if (inCenterX && inCenterY) {
      // 找到当前在i号格子上的项的数组索引
      const occupantIdx = gridItems.findIndex((it) => it.slot === i);
      if (occupantIdx === -1 || occupantIdx === draggingIndex) continue;

      // 创建新的数组副本（只修改必要的位置）
      const newList = [...gridItems];

      // 交换位置：只更新slot和tx/ty
      const targetSlot = newList[draggingIndex].slot;

      newList[occupantIdx] = {
        ...newList[occupantIdx],
        slot: targetSlot
      };

      newList[draggingIndex] = {
        ...newList[draggingIndex],
        slot: i
      };

      return newList;
    }
  }

  return null;
}

/**
 * 拖拽结束后的数据归位（优化版）
 * 按照slot编号重新排序，并清空所有偏移量
 * @param gridItems 网格项数组
 * @returns 排序后的网格项数组
 */
export function finalizeDrag(gridItems: GridItem[]): GridItem[] {
  // 创建固定长度的数组，避免动态扩容
  const sortedList = new Array(9);

  // 使用for循环代替forEach，性能更好
  for (let i = 0; i < gridItems.length; i++) {
    const item = gridItems[i];
    sortedList[item.slot] = item;
  }

  // 创建新对象，避免修改原数据
  for (let i = 0; i < 9; i++) {
    const item = sortedList[i];
    if (item && (item.tx !== 0 || item.ty !== 0)) {
      sortedList[i] = {
        ...item,
        tx: 0,
        ty: 0
      };
    }
  }

  return sortedList;
}

/**
 * 检查是否还有空格子
 * @param gridItems 网格项数组
 * @returns boolean
 */
export function hasEmptySlots(gridItems: GridItem[]): boolean {
  const emptyCount = gridItems.filter(
    (it) => it.id !== 'logo' && !it.src
  ).length;
  return emptyCount > 0;
}

/**
 * 获取已填充图片的数量
 * @param gridItems 网格项数组
 * @returns number
 */
export function getFilledImageCount(gridItems: GridItem[]): number {
  return gridItems.filter((it) => it.id !== 'logo' && it.src).length;
}

/**
 * 填充图片到网格
 * @param gridItems 当前网格项
 * @param imagePaths 图片路径数组
 * @returns 更新后的网格项数组
 */
export function fillImagesToGrid(
  gridItems: GridItem[],
  imagePaths: string[]
): GridItem[] {
  const newList = [...gridItems];
  let pathIndex = 0;

  // 按照 slot 顺序（0-8）遍历，找到对应 slot 的 item 进行填充
  for (let slotIndex = 0; slotIndex < 9; slotIndex++) {
    // 找到当前在这个 slot 位置上的 item
    const itemIndex = newList.findIndex((it) => it.slot === slotIndex);
    if (itemIndex === -1) continue;

    const item = newList[itemIndex];

    // 跳过Logo位置
    if (item.id === 'logo') continue;

    // 填充图片
    newList[itemIndex] = {
      ...item,
      src: imagePaths[pathIndex] || ''
    };
    pathIndex++;
  }

  return newList;
}

/**
 * 删除指定ID的图片
 * @param gridItems 网格项数组
 * @param id 要删除的项ID
 * @returns 更新后的网格项数组
 */
export function removeImageById(
  gridItems: GridItem[],
  id: string
): GridItem[] {
  return gridItems.map((item) => {
    if (item.id === id) {
      return { ...item, src: '' };
    }
    return item;
  });
}

/**
 * 设置指定格子的图片
 * @param gridItems 网格项数组
 * @param index 格子索引
 * @param src 图片路径
 * @returns 更新后的网格项数组
 */
export function setImageAtIndex(
  gridItems: GridItem[],
  index: number,
  src: string
): GridItem[] {
  const newList = [...gridItems];
  newList[index] = { ...newList[index], src };
  return newList;
}

/**
 * 获取拖拽状态的初始值
 * @returns DragState
 */
export function getInitialDragState(): DragState {
  return {
    draggingIndex: -1,
    ghostX: 0,
    ghostY: 0,
    ghostSrc: '',
    touchStartX: 0,
    touchStartY: 0,
    isActuallyDragging: false
  };
}

/**
 * 是否可以开始拖拽
 * @param item 网格项
 * @returns boolean
 */
export function canStartDrag(item: GridItem): boolean {
  // Logo位置不能拖拽，空格子不能拖拽
  return item.id !== 'logo' && !!item.src;
}
