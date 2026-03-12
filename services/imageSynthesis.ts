/**
 * 图片合成服务
 * 负责九宫格图片的高清Canvas合成
 */

import {
  CANVAS_CONFIG,
  FONT_CONFIG,
  COLOR_CONFIG,
  TEXT_POSITION,
  APP_INFO
} from '../constants/index';

import type { GridItem, CanvasContext } from '../types/index';

/**
 * 初始化Canvas
 * @returns Promise<CanvasContext>
 */
export function initCanvas(): Promise<CanvasContext> {
  return new Promise((resolve, reject) => {
    const query = wx.createSelectorQuery();
    query.select('#gridCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]?.node) {
          reject(new Error('Canvas初始化失败'));
          return;
        }

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const { width, gridHeight, gridGap, startY, bottomPadding } = CANVAS_CONFIG;

        // 计算画布高度
        const height = startY + (gridHeight * 3 + gridGap * 2) + bottomPadding;

        // 设置画布尺寸
        canvas.width = width;
        canvas.height = height;

        // 填充背景
        ctx.fillStyle = COLOR_CONFIG.background;
        ctx.fillRect(0, 0, width, height);

        resolve({ canvas, ctx, width, height });
      });
  });
}

/**
 * 加载图片
 * @param canvas Canvas节点
 * @param src 图片路径
 * @returns Promise<HTMLImageElement | null>
 */
export function loadImage(canvas: any, src: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!src) {
      resolve(null);
      return;
    }

    const img = canvas.createImage();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
}

/**
 * 绘制居中文本
 * @param ctx Canvas上下文
 * @param canvasWidth 画布宽度
 * @param config 文本配置
 */
export function drawCenterText(
  ctx: any,
  canvasWidth: number,
  config: {
    text: string;
    font: string;
    color: string;
    y: number;
    letterSpacing?: number;
  }
): void {
  const { text, font, color, y, letterSpacing = 0 } = config;

  if (!text) return;

  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  if (letterSpacing > 0) {
    // 计算总宽度
    const chars = text.split('');
    let totalWidth = 0;
    chars.forEach((char, i) => {
      totalWidth += ctx.measureText(char).width;
      if (i < chars.length - 1) totalWidth += letterSpacing;
    });

    // 绘制每个字符
    let currentX = (canvasWidth - totalWidth) / 2;
    chars.forEach((char) => {
      const charWidth = ctx.measureText(char).width;
      ctx.fillText(char, currentX + charWidth / 2, y);
      currentX += charWidth + letterSpacing;
    });
  } else {
    ctx.fillText(text, canvasWidth / 2, y);
  }
}

/**
 * 绘制网格图片
 * @param ctx Canvas上下文
 * @param canvas Canvas节点
 * @param gridIndex 网格索引(0-8)
 * @param src 图片路径
 * @param gridConfig 网格配置
 */
export async function drawGridImage(
  ctx: any,
  canvas: any,
  gridIndex: number,
  src: string,
  gridConfig: {
    startX: number;
    startY: number;
    width: number;
    height: number;
    gap: number;
  }
): Promise<void> {
  const { startX, startY, width, height, gap } = gridConfig;

  // 计算行列位置
  const row = Math.floor(gridIndex / 3);
  const col = gridIndex % 3;

  // 计算实际坐标
  const x = startX + col * (width + gap);
  const y = startY + row * (height + gap);

  if (src) {
    try {
      const img = await loadImage(canvas, src);
      if (img) {
        // 计算裁剪区域（保持1:1比例）
        const imgRatio = img.width / img.height;
        const targetRatio = 1;
        let cropWidth, cropHeight, offsetX, offsetY;

        if (imgRatio > targetRatio) {
          // 图片更宽，裁剪两边
          cropHeight = img.height;
          cropWidth = img.height * targetRatio;
          offsetX = (img.width - cropWidth) / 2;
          offsetY = 0;
        } else {
          // 图片更高，裁剪上下
          cropWidth = img.width;
          cropHeight = img.width / targetRatio;
          offsetX = 0;
          offsetY = (img.height - cropHeight) / 2;
        }

        ctx.drawImage(
          img,
          offsetX, offsetY, cropWidth, cropHeight,
          x, y, width, height
        );
      }
    } catch (err) {
      console.error('加载图片失败:', src, err);
      // 绘制占位符
      ctx.fillStyle = COLOR_CONFIG.gridPlaceholder;
      ctx.fillRect(x, y, width, height);
    }
  } else {
    // 空格子绘制占位符
    ctx.fillStyle = COLOR_CONFIG.gridPlaceholder;
    ctx.fillRect(x, y, width, height);
  }
}

/**
 * 合成完整图片（支持Canvas复用和并行加载）
 * @param params 合成参数
 * @param existingCanvas 可选：复用的Canvas上下文
 * @returns Promise<string> 临时文件路径
 */
export async function synthesizeImage(
  params: {
    title: string;
    currentDate: string;
    gridItems: GridItem[];
    currentLogoIndex: number;
    logoList: string[];
  },
  existingCanvas?: CanvasContext
): Promise<string> {
  const { title, currentDate, gridItems, currentLogoIndex, logoList } = params;

  // 初始化Canvas（复用或新建）
  let canvasCtx: CanvasContext;
  if (existingCanvas) {
    canvasCtx = existingCanvas;
    // 清空画布
    const { ctx, width, height } = canvasCtx;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = COLOR_CONFIG.background;
    ctx.fillRect(0, 0, width, height);
  } else {
    canvasCtx = await initCanvas();
  }

  const { canvas, ctx, width, height } = canvasCtx;

  // 绘制标题
  drawCenterText(ctx, width, {
    text: title,
    font: FONT_CONFIG.title,
    color: COLOR_CONFIG.title,
    y: TEXT_POSITION.titleY,
    letterSpacing: TEXT_POSITION.titleLetterSpacing
  });

  // 绘制日期
  drawCenterText(ctx, width, {
    text: currentDate,
    font: FONT_CONFIG.date,
    color: COLOR_CONFIG.date,
    y: TEXT_POSITION.dateY,
    letterSpacing: TEXT_POSITION.dateLetterSpacing
  });

  // 网格配置
  const gridConfig = {
    startX: CANVAS_CONFIG.startX,
    startY: CANVAS_CONFIG.startY,
    width: CANVAS_CONFIG.gridWidth,
    height: CANVAS_CONFIG.gridHeight,
    gap: CANVAS_CONFIG.gridGap
  };

  // ===== 并行加载所有图片 =====
  const imageLoadPromises = gridItems.map(async (item, index) => {
    let src: string;

    if (item.id === 'logo') {
      // Logo格子
      src = currentLogoIndex !== -1 ? logoList[currentLogoIndex] : '';
    } else {
      // 普通图片格子
      src = item.src;
    }

    if (!src) {
      return { index, img: null, src: '' };
    }

    try {
      const img = await loadImage(canvas, src);
      return { index, img, src };
    } catch (err) {
      console.error('加载图片失败:', src, err);
      return { index, img: null, src: '' };
    }
  });

  // 等待所有图片加载完成
  const loadedImages = await Promise.all(imageLoadPromises);

  // 按顺序绘制所有图片
  loadedImages.forEach(({ index, img, src }) => {
    if (img) {
      drawLoadedImage(ctx, img, index, gridConfig);
    } else {
      // 绘制占位符
      const { startX, startY, width: gw, height: gh, gap } = gridConfig;
      const row = Math.floor(index / 3);
      const col = index % 3;
      const x = startX + col * (gw + gap);
      const y = startY + row * (gh + gap);
      ctx.fillStyle = COLOR_CONFIG.gridPlaceholder;
      ctx.fillRect(x, y, gw, gh);
    }
  });

  // 绘制标语
  drawCenterText(ctx, width, {
    text: APP_INFO.slogan,
    font: FONT_CONFIG.slogan,
    color: COLOR_CONFIG.date,
    y: height - TEXT_POSITION.sloganOffset,
    letterSpacing: TEXT_POSITION.sloganLetterSpacing
  });

  // 导出图片
  return new Promise((resolve, reject) => {
    wx.canvasToTempFilePath({
      canvas,
      success: (res) => resolve(res.tempFilePath),
      fail: reject
    });
  });
}

/**
 * 绘制已加载的图片（不重新加载）
 * @param ctx Canvas上下文
 * @param img 已加载的图片对象
 * @param gridIndex 网格索引
 * @param gridConfig 网格配置
 */
function drawLoadedImage(
  ctx: any,
  img: any,
  gridIndex: number,
  gridConfig: {
    startX: number;
    startY: number;
    width: number;
    height: number;
    gap: number;
  }
): void {
  const { startX, startY, width, height, gap } = gridConfig;

  // 计算行列位置
  const row = Math.floor(gridIndex / 3);
  const col = gridIndex % 3;

  // 计算实际坐标
  const x = startX + col * (width + gap);
  const y = startY + row * (height + gap);

  // 计算裁剪区域（保持1:1比例）
  const imgRatio = img.width / img.height;
  const targetRatio = 1;
  let cropWidth, cropHeight, offsetX, offsetY;

  if (imgRatio > targetRatio) {
    // 图片更宽，裁剪两边
    cropHeight = img.height;
    cropWidth = img.height * targetRatio;
    offsetX = (img.width - cropWidth) / 2;
    offsetY = 0;
  } else {
    // 图片更高，裁剪上下
    cropWidth = img.width;
    cropHeight = img.width / targetRatio;
    offsetX = 0;
    offsetY = (img.height - cropHeight) / 2;
  }

  ctx.drawImage(
    img,
    offsetX, offsetY, cropWidth, cropHeight,
    x, y, width, height
  );
}

/**
 * 保存图片到相册
 * @param filePath 图片临时文件路径
 * @returns Promise<boolean>
 */
export function saveImageToAlbum(filePath: string): Promise<boolean> {
  return new Promise((resolve) => {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => resolve(true),
      fail: () => resolve(false)
    });
  });
}

/**
 * 批量选择图片（带压缩）
 * @param count 选择数量
 * @param compress 是否压缩
 * @returns Promise<string[]> 压缩后的图片路径数组
 */
export function chooseImages(count: number, compress: boolean = true): Promise<string[]> {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count,
      mediaType: ['image'],
      sizeType: compress ? ['compressed'] : ['original'],
      success: (res) => {
        // 直接返回选择的路径，避免二次压缩
        const paths = res.tempFiles.map((f) => f.tempFilePath);
        resolve(paths);
      },
      fail: reject
    });
  });
}

/**
 * 单选图片（带压缩）
 * @param compress 是否压缩
 * @returns Promise<string | null> 压缩后的图片路径
 */
export function chooseSingleImage(compress: boolean = true): Promise<string | null> {
  return new Promise((resolve) => {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: compress ? ['compressed'] : ['original'],
      success: (res) => {
        // 直接返回选择的路径，避免二次压缩
        const tempPath = res.tempFiles[0].tempFilePath;
        resolve(tempPath);
      },
      fail: () => resolve(null)
    });
  });
}

/**
 * 压缩图片
 * @param src 原图路径
 * @param quality 压缩质量 0-100
 * @returns Promise<string> 压缩后路径
 */
export function compressImage(src: string, quality: number = 80): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src,
      quality,
      success: (res) => resolve(res.tempFilePath),
      fail: reject
    });
  });
}
