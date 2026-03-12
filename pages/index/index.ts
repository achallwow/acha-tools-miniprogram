// pages/index/index.ts
// 工作日报生成器 - 九宫格图片拼接

import {
  INITIAL_GRID_ITEMS,
  LOGO_LIST,
  DEFAULT_LOGO_INDEX,
  DELAY_CONFIG,
  IMAGE_PICK_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  SHARE_CONFIG
} from '../../constants/index';

import { formatDate } from '../../utils/date';
import { checkAndAuthorizePhotosAlbum } from '../../services/permission';
import { synthesizeImage, saveImageToAlbum, chooseImages, chooseSingleImage, initCanvas } from '../../services/imageSynthesis';
import { fillImagesToGrid, removeImageById, setImageAtIndex, hasEmptySlots } from '../../services/dragEngine';
import type { GridItem, IndexPageData } from '../../types/index';

Page<IndexPageData> ({
  data: {
    title: '',
    currentDate: '',
    logoList: LOGO_LIST as string[],
    currentLogoIndex: DEFAULT_LOGO_INDEX,
    showLogoPicker: false,
    gridItems: JSON.parse(JSON.stringify(INITIAL_GRID_ITEMS)) as GridItem[],
    hasEmptySlot: true,
    gridSlots: [0, 1, 2, 3, 4, 5, 6, 7, 8],

    // 拖拽相关
    isDragging: false,
    dragId: '',
    dragSrc: '',
    dragX: 0,
    dragY: 0,
    // slotRects and other non-serializable data are managed outside of `data`
  },

  canvasContext: null as any,
  slotRects: [] as any[],
  dragItem: null as GridItem | null,
  dragIndex: -1,
  dragOffsetX: 0,
  dragOffsetY: 0,

  onLoad() {
    this.initDate();
    this.initCanvas();
    this.loadTemplate();
    // 延迟获取格子位置
    setTimeout(() => this.measureSlots(), 500);
  },

  onUnload() {
    this.saveTemplate();
  },

  initDate() {
    this.setData({ currentDate: formatDate() });
  },

  async initCanvas() {
    try {
      this.canvasContext = await initCanvas();
    } catch (err) {
      console.error('Canvas初始化失败:', err);
    }
  },

  measureSlots() {
    wx.createSelectorQuery()
      .selectAll('.grid-item')
      .boundingClientRect((rects: any) => {
        this.slotRects = rects || [];
      })
      .exec();
  },

  loadTemplate() {
    try {
      const template = wx.getStorageSync('dailyReportTemplate');
      if (template) {
        this.setData({
          title: template.title || '',
          currentLogoIndex: template.currentLogoIndex ?? DEFAULT_LOGO_INDEX
        });
      }
    } catch (err) {
      console.error('加载模板失败:', err);
    }
  },

  saveTemplate() {
    try {
      wx.setStorageSync('dailyReportTemplate', {
        title: this.data.title,
        currentLogoIndex: this.data.currentLogoIndex,
        savedAt: Date.now()
      });
    } catch (err) {
      console.error('保存模板失败:', err);
    }
  },

  // ==================== 拖拽核心 ====================

  onDragStart(e: WechatMiniprogram.TouchEvent) {
    const slot = e.currentTarget.dataset.index as number;
    const item = this.data.gridItems.find((it: GridItem) => it.slot === slot);
    if (!item || item.id === 'logo' || !item.src) return;

    const itemIndex = this.data.gridItems.findIndex((it: GridItem) => it.id === item.id);
    const touch = e.touches[0];
    const rect = this.slotRects[slot];
    if (!rect) {
      this.measureSlots();
      return;
    }

    this.dragItem = item;
    this.dragIndex = itemIndex;
    this.dragOffsetX = touch.clientX - rect.left;
    this.dragOffsetY = touch.clientY - rect.top;

    this.setData({
      isDragging: true,
      dragId: item.id,
      dragSrc: item.src,
      dragX: rect.left,
      dragY: rect.top,
    });

    wx.vibrateShort({ type: 'light' });
  },

  onDragMove(e: WechatMiniprogram.TouchEvent) {
    if (!this.data.isDragging || !this.dragItem) return;

    const touch = e.touches[0];

    this.setData({
      dragX: touch.clientX - this.dragOffsetX,
      dragY: touch.clientY - this.dragOffsetY,
    });

    this.checkSwap(touch.clientX, touch.clientY);
  },

  lastSwapTime: 0,
  checkSwap(touchX: number, touchY: number) {
    const now = Date.now();
    if (now - this.lastSwapTime < 100) return;

    let targetSlot = -1;
    for (let i = 0; i < this.slotRects.length; i++) {
      const rect = this.slotRects[i];
      if (!rect) continue;

      if (touchX >= rect.left && touchX <= rect.right &&
          touchY >= rect.top && touchY <= rect.bottom) {
        targetSlot = i;
        break;
      }
    }

    if (targetSlot === -1 || (this.dragItem && this.dragItem.slot === targetSlot) || targetSlot === 4) return;

    const targetItem = this.data.gridItems.find((it: GridItem) => it.slot === targetSlot);
    if (!targetItem || targetItem.id === 'logo') return;

    this.swapSlots(this.dragItem!.slot, targetSlot);
    this.lastSwapTime = now;
    wx.vibrateShort({ type: 'light' });
  },

  swapSlots(fromSlot: number, toSlot: number) {
    const newItems = this.data.gridItems.map((item: GridItem) => {
      if (item.slot === fromSlot) return { ...item, slot: toSlot };
      if (item.slot === toSlot) return { ...item, slot: fromSlot };
      return item;
    });

    if (this.dragItem) {
      this.dragItem = { ...this.dragItem, slot: toSlot };
    }

    this.setData({ gridItems: newItems });
  },

  onDragEnd() {
    if (!this.data.isDragging) return;
    this.setData({ isDragging: false, dragId: '', dragSrc: '' });
    this.dragItem = null;
    this.dragIndex = -1;
    this.checkSlots();
  },

  // ==================== 网格操作 ====================

  checkSlots() {
    this.setData({ hasEmptySlot: hasEmptySlots(this.data.gridItems) });
  },

  onGridItemTap(e: WechatMiniprogram.TouchEvent) {
    if (this.data.isDragging) return;
    const slot = e.currentTarget.dataset.index as number;
    const item = this.data.gridItems.find((it: GridItem) => it.slot === slot);
    if (!item) return;

    if (item.id === 'logo') {
      this.setData({ showLogoPicker: true });
      return;
    }

    if (item.src) return;
    const index = this.data.gridItems.findIndex((it: GridItem) => it.id === item.id);
    this.selectSingleImage(index);
  },

  async selectSingleImage(index: number) {
    const imagePath = await chooseSingleImage();
    if (imagePath) {
      const newList = setImageAtIndex(this.data.gridItems, index, imagePath);
      this.setData({ gridItems: newList });
      this.checkSlots();
    }
  },

  async chooseMultipleImages() {
    try {
      const paths = await chooseImages(IMAGE_PICK_CONFIG.maxCount);
      const newList = fillImagesToGrid(this.data.gridItems, paths);
      this.setData({ gridItems: newList });
      this.checkSlots();
    } catch (err) {
      console.log('用户取消选择');
    }
  },

  deleteImage(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    const newList = removeImageById(this.data.gridItems, id);
    this.setData({ gridItems: newList });
    this.checkSlots();
  },

  // ==================== Logo选择 ====================

  closeLogoPicker() {
    this.setData({ showLogoPicker: false });
  },

  selectLogo(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.logoIndex as number;
    this.setData({ currentLogoIndex: index, showLogoPicker: false });
  },

  // ==================== 标题输入 ====================

  onTitleInput(e: WechatMiniprogram.Input) {
    this.setData({ title: e.detail.value.trim() });
  },

  // ==================== 保存 ====================

  async saveGridImage() {
    if (hasEmptySlots(this.data.gridItems)) {
      wx.showToast({ title: ERROR_MESSAGES.emptySlots, icon: 'none' });
      return;
    }

    const authorized = await checkAndAuthorizePhotosAlbum();
    if (!authorized) return;

    wx.showLoading({ title: LOADING_MESSAGES.generating, mask: true });

    try {
      const tempFilePath = await synthesizeImage({
        title: this.data.title,
        currentDate: this.data.currentDate,
        gridItems: this.data.gridItems,
        currentLogoIndex: this.data.currentLogoIndex,
        logoList: this.data.logoList
      }, this.canvasContext);

      const saved = await saveImageToAlbum(tempFilePath);

      wx.showToast({
        title: saved ? SUCCESS_MESSAGES.saved : ERROR_MESSAGES.saveFailed,
        icon: saved ? 'success' : 'none'
      });
    } catch (err) {
      console.error('图片合成失败:', err);
      wx.showToast({ title: ERROR_MESSAGES.synthesisFailed, icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // ==================== 导航 & 分享 ====================

  onBackTap() {
    wx.navigateBack({ delta: 1 });
  },

  onShareAppMessage() {
    return { title: SHARE_CONFIG.title, path: SHARE_CONFIG.path };
  },

  noop() {}
});
