
// pages/index/index.ts
import { IGridItem, IRect } from '../../types/index';
import { checkAndRequestPhotosAlbumScope } from '../../utils/util';

/**
 * @file 工作日报生成页核心逻辑
 * @description 该页面集成了图片拖拽排序、Logo选择、标题编辑以及最终图片合成与保存的功能。
 */
Page({
  data: {
    // --- 页面内容数据 ---
    title: '',
    currentDate: '',

    // --- Logo 相关 ---
    logoList: ['/static/images/logo1.png', '/static/images/logo2.png', '/static/images/logo3.png'],
    currentLogoIndex: -1,
    showLogoPicker: false,

    // --- 页面布局及导航 ---
    navTop: 0,
    navHeight: 0,

    // --- 【核心数据】九宫格 ---
    gridItems: [
      { id: 'item-0', src: '', tx: 0, ty: 0, slot: 0 },
      { id: 'item-1', src: '', tx: 0, ty: 0, slot: 1 },
      { id: 'item-2', src: '', tx: 0, ty: 0, slot: 2 },
      { id: 'item-3', src: '', tx: 0, ty: 0, slot: 3 },
      { id: 'logo',   src: '', tx: 0, ty: 0, slot: 4 },
      { id: 'item-5', src: '', tx: 0, ty: 0, slot: 5 },
      { id: 'item-6', src: '', tx: 0, ty: 0, slot: 6 },
      { id: 'item-7', src: '', tx: 0, ty: 0, slot: 7 },
      { id: 'item-8', src: '', tx: 0, ty: 0, slot: 8 }
    ] as IGridItem[],
    slotRects: [] as IRect[],

    // --- 拖拽交互状态 ---
    draggingIndex: -1,
    ghostX: 0, ghostY: 0,
    ghostSrc: '',
    touchStartX: 0, touchStartY: 0,
    isActuallyDragging: false,

    // --- UI 状态 ---
    hasEmptySlot: true,
  },

  onLoad() {
    const cachedTitle = wx.getStorageSync('daily_report_title') as string;
    const cachedLogoIndex = wx.getStorageSync('daily_report_logo_index');
    const rect = wx.getMenuButtonBoundingClientRect();
    const now = new Date();
    this.setData({
      navTop: rect.top,
      navHeight: rect.height,
      currentDate: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`,
      title: cachedTitle || '',
      currentLogoIndex: cachedLogoIndex === '' || cachedLogoIndex === null ? -1 : Number(cachedLogoIndex)
    });
    
    if (this.data.currentLogoIndex !== -1) {
      this.updateLogoSrc(this.data.currentLogoIndex);
    }

    setTimeout(() => { this.refreshSlotRects(); }, 300);
  },
  
  onDragStart(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index as number;
    const item = this.data.gridItems[index];
    if (item.id === 'logo' || !item.src) return;

    const touch = e.touches[0];
    this.setData({
      draggingIndex: index,
      touchStartX: touch.clientX,
      touchStartY: touch.clientY,
      ghostSrc: item.src,
      ghostX: touch.clientX - 50,
      ghostY: touch.clientY - 50,
      isActuallyDragging: false
    });
  },

  onDragMove(e: WechatMiniprogram.TouchEvent) {
    if (this.data.draggingIndex === -1) return;
    const touch = e.touches[0];
    const { touchStartX, touchStartY, draggingIndex, slotRects, gridItems } = this.data;

    const moveDist = Math.hypot(touch.clientX - touchStartX, touch.clientY - touchStartY);
    if (moveDist > 15 && !this.data.isActuallyDragging) {
      this.setData({ isActuallyDragging: true });
      wx.vibrateShort({ type: 'medium' });
    }
    if (!this.data.isActuallyDragging) return;

    this.setData({ ghostX: touch.clientX - 50, ghostY: touch.clientY - 50 });

    const currentSlotIndex = gridItems[draggingIndex].slot;

    for (let i = 0; i < slotRects.length; i++) {
      if (i === 4) continue;
      const occupantIdx = gridItems.findIndex((it: IGridItem) => it.slot === i);
      if (occupantIdx === draggingIndex) continue;

      const rect = slotRects[i];
      if (touch.clientX > rect.left && touch.clientX < rect.right &&
          touch.clientY > rect.top && touch.clientY < rect.bottom) {

        const newList = [...gridItems];
        const targetRect = slotRects[currentSlotIndex];
        const initialRect = slotRects[i]; 

        const occupant = newList[occupantIdx];
        if (occupant) {
          occupant.tx = targetRect.left - initialRect.left;
          occupant.ty = targetRect.top - initialRect.top;
          occupant.slot = currentSlotIndex;
        }
        
        newList[draggingIndex].slot = i;

        wx.vibrateShort({ type: 'light' });
        this.setData({ gridItems: newList });
        break;
      }
    }
  },

  onDragEnd() {
    if (this.data.draggingIndex === -1) return;
    const sortedList = [...this.data.gridItems].sort((a: IGridItem, b: IGridItem) => a.slot - b.slot);
    sortedList.forEach((item: IGridItem) => {
      item.tx = 0;
      item.ty = 0;
    });

    this.setData({ 
      gridItems: sortedList,
      draggingIndex: -1,
      isActuallyDragging: false
    });
    this.checkHasEmptySlot();
  },

  onGridItemTap(e: WechatMiniprogram.TouchEvent) {
    if (this.data.isActuallyDragging) return;
    const index = e.currentTarget.dataset.index as number;
    const item = this.data.gridItems[index];

    if (item.id === 'logo') {
      this.setData({ showLogoPicker: true });
      return;
    }

    if (item.src) return;

    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res: WechatMiniprogram.ChooseImageSuccessCallbackResult) => {
        this.setData({
          [`gridItems[${index}].src`]: res.tempFilePaths[0]
        });
        this.checkHasEmptySlot();
      }
    });
  },

  chooseImages() {
    const emptySlotsCount = this.data.gridItems.filter((it: IGridItem) => it.id !== 'logo' && !it.src).length;
    if (emptySlotsCount === 0) return;

    wx.chooseMedia({
      count: emptySlotsCount,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res: WechatMiniprogram.ChooseMediaSuccessCallbackResult) => {
        const paths = res.tempFiles.map((f: WechatMiniprogram.MediaFile) => f.tempFilePath);
        const newList = [...this.data.gridItems];
        let pathIndex = 0;
        newList.forEach((item: IGridItem) => {
          if (item.id !== 'logo' && !item.src && pathIndex < paths.length) {
            item.src = paths[pathIndex];
            pathIndex++;
          }
        });
        this.setData({ gridItems: newList });
        this.checkHasEmptySlot();
      }
    });
  },

  deleteImage(e: WechatMiniprogram.TouchEvent) {
    const id = e.currentTarget.dataset.id as string;
    const index = this.data.gridItems.findIndex((it: IGridItem) => it.id === id);
    if (index !== -1) {
      this.setData({
        [`gridItems[${index}].src`]: ''
      });
      this.checkHasEmptySlot();
    }
  },

  selectLogo(e: WechatMiniprogram.TouchEvent) { 
    const logoIndex = e.currentTarget.dataset.logoIndex as number;
    this.setData({ 
      currentLogoIndex: logoIndex, 
      showLogoPicker: false,
    });
    this.updateLogoSrc(logoIndex);
    wx.setStorageSync('daily_report_logo_index', logoIndex);
  },
  
  updateLogoSrc(logoIndex: number) {
    if (logoIndex < 0 || logoIndex >= this.data.logoList.length) return;
    const logoSrc = this.data.logoList[logoIndex];
    const logoItemIndex = this.data.gridItems.findIndex((it: IGridItem) => it.id === 'logo');
    if (logoItemIndex !== -1) {
       this.setData({ [`gridItems[${logoItemIndex}].src`]: logoSrc });
    }
  },

  async saveGridImage() {
    if (!this.data.title) {
      return wx.showToast({ title: '请输入标题', icon: 'none' });
    }
    if (this.data.currentLogoIndex === -1) {
      return wx.showToast({ title: '请选择一个Logo', icon: 'none' });
    }
    if (this.data.gridItems.some((it: IGridItem) => it.id !== 'logo' && !it.src)) {
      return wx.showToast({ title: '请先填满所有图片格子', icon: 'none' });
    }

    const authorized = await checkAndRequestPhotosAlbumScope();
    if (!authorized) return;

    wx.showLoading({ title: '图片生成中...', mask: true });

    try {
      const tempFilePath = await this.doImageSynthesis();
      wx.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: () => wx.showToast({ title: '已保存至相册', icon: 'success' }),
        fail: (err) => {
          console.error("保存失败: ", err);
          wx.showToast({ title: '保存失败', icon: 'none' });
        }
      });
    } catch (err) {
      console.error('图片合成失败', err);
      wx.showToast({ title: '图片合成失败，请重试', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  doImageSynthesis(): Promise<string> {
    return new Promise((resolve, reject) => {
      const query = this.createSelectorQuery();
      query.select('#gridCanvas').fields({ node: true, size: true }).exec(async (res: any) => {
        if (!res[0] || !res[0].node) return reject(new Error('获取Canvas节点失败'));
        const canvas = res[0].node as WechatMiniprogram.Canvas;
        const ctx = canvas.getContext('2d') as WechatMiniprogram.CanvasRenderingContext2D;

        const dpr = wx.getSystemInfoSync().pixelRatio;
        const W = 1242, gridW = 388, gridGap = 8, gridStartX = 31, gridStartY = 280;
        const H = gridStartY + (gridW * 3 + gridGap * 2) + 200;

        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);
        
        const { title, currentDate, gridItems, currentLogoIndex, logoList } = this.data;

        this.drawCanvasText(ctx, title, 'bold 72px sans-serif', '#222222', W / 2, 100);
        this.drawCanvasText(ctx, currentDate, 'bold 36px sans-serif', '#666666', W / 2, 200);

        const loadImage = (src: string): Promise<WechatMiniprogram.Image | null> => new Promise((r) => {
          if (!src) return r(null);
          const img = canvas.createImage();
          img.src = src;
          img.onload = () => r(img);
          img.onerror = () => r(null);
        });

        try {
          const imagePromises = gridItems.map((item: IGridItem) => {
            const src = (item.id === 'logo') 
                ? (currentLogoIndex !== -1 ? logoList[currentLogoIndex] : '') 
                : item.src;
            return loadImage(src);
          });
          const images = await Promise.all(imagePromises);

          for (let i = 0; i < images.length; i++) {
            const row = Math.floor(i / 3), col = i % 3;
            const x = gridStartX + col * (gridW + gridGap);
            const y = gridStartY + row * (gridW + gridGap);
            const img = images[i];

            if (img) {
              this.drawAspectFillImage(ctx, img, x, y, gridW, gridW);
            } else {
              ctx.fillStyle = '#f8f8f8';
              ctx.fillRect(x, y, gridW, gridW);
            }
          }

          this.drawCanvasText(ctx, '专注您的生活', 'bold 32px sans-serif', '#666666', W / 2, H - 125);

          setTimeout(() => {
            wx.canvasToTempFilePath({ canvas, success: (res: WechatMiniprogram.CanvasToTempFilePathSuccessCallbackResult) => resolve(res.tempFilePath), fail: reject });
          }, 100);

        } catch (err) {
          reject(err);
        }
      });
    });
  },

  refreshSlotRects() {
    this.createSelectorQuery().selectAll('.grid-item').boundingClientRect((rects: WechatMiniprogram.BoundingClientRectCallbackResult[]) => {
      this.setData({ slotRects: rects as IRect[] });
    }).exec();
  },

  checkHasEmptySlot() {
    const hasEmpty = this.data.gridItems.some((it: IGridItem) => it.id !== 'logo' && !it.src);
    this.setData({ hasEmptySlot: hasEmpty });
  },

  drawCanvasText(ctx: WechatMiniprogram.CanvasRenderingContext2D, text: string, font: string, color: string, x: number, y: number) {
    if (!text) return;
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
  },

  drawAspectFillImage(ctx: WechatMiniprogram.CanvasRenderingContext2D, img: WechatMiniprogram.Image, x: number, y: number, w: number, h: number) {
    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;
    let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

    if (imgRatio > canvasRatio) {
      sWidth = img.height * canvasRatio;
      sx = (img.width - sWidth) / 2;
    } else {
      sHeight = img.width / canvasRatio;
      sy = (img.height - sHeight) / 2;
    }
    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
  },

  onTitleInput(e: WechatMiniprogram.Input) {
    const newTitle = e.detail.value.trim();
    this.setData({ title: newTitle });
    wx.setStorageSync('daily_report_title', newTitle);
  },
  
  closeLogoPicker() { this.setData({ showLogoPicker: false }); },
  onBackTap() { wx.navigateBack({ delta: 1 }); },
  noop() { },

  onShareAppMessage() {
    return {
      title: '快来试试这个超好用的工作日报生成器！',
      path: '/pages/index/index'
    };
  }
});
