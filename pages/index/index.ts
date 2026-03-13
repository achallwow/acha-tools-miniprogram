// pages/index/index.ts
import { IGridItem, IRect } from \'../../types/index\';
import { checkAndRequestPhotosAlbumScope } from \'../../utils/util\';

Page({
  data: {
    title: \'\',
    currentDate: \'\',
    logoList: [\'/static/images/logo1.png\', \'/static/images/logo2.png\', \'/static/images/logo3.png\'],
    currentLogoIndex: -1,
    showLogoPicker: false,
    navTop: 0,
    navHeight: 0,
    gridItems: [
      { id: \'item-0\', src: \'\', tx: 0, ty: 0, slot: 0 },
      { id: \'item-1\', src: \'\', tx: 0, ty: 0, slot: 1 },
      { id: \'item-2\', src: \'\', tx: 0, ty: 0, slot: 2 },
      { id: \'item-3\', src: \'\', tx: 0, ty: 0, slot: 3 },
      { id: \'logo\',   src: \'\', tx: 0, ty: 0, slot: 4 },
      { id: \'item-5\', src: \'\', tx: 0, ty: 0, slot: 5 },
      { id: \'item-6\', src: \'\', tx: 0, ty: 0, slot: 6 },
      { id: \'item-7\', src: \'\', tx: 0, ty: 0, slot: 7 },
      { id: \'item-8\', src: \'\', tx: 0, ty: 0, slot: 8 }
    ] as IGridItem[],
    slotRects: [] as IRect[],
    draggingIndex: -1,
    ghostX: 0, ghostY: 0,
    ghostSrc: \'\',
    touchStartX: 0, touchStartY: 0,
    isActuallyDragging: false,
    hasEmptySlot: true
  },

  onLoad() {
    // 1. 读取缓存
    const cachedTitle = wx.getStorageSync(\'daily_report_title\') as string;
    const cachedLogoIndex = wx.getStorageSync(\'daily_report_logo_index\');

    const rect = wx.getMenuButtonBoundingClientRect();
    const now = new Date();
    this.setData({
      navTop: rect.top,
      navHeight: rect.height,
      currentDate: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, \'0\')}.${String(now.getDate()).padStart(2, \'0\')}`,
      title: cachedTitle || \'\',
      currentLogoIndex: cachedLogoIndex === \'\' ? -1 : Number(cachedLogoIndex)
    });
    
    // 如果有缓存的 Logo，需要同步更新 gridItems 中的 logo src
    if (this.data.currentLogoIndex !== -1) {
      const logoSrc = this.data.logoList[this.data.currentLogoIndex];
      this.setData({
        \'gridItems[4].src\': logoSrc
      });
    }

    setTimeout(() => { this.refreshSlotRects(); }, 300);
  },
  
  refreshSlotRects() {
    wx.createSelectorQuery().selectAll(\'.grid-item\').boundingClientRect((rects) => {
      this.setData({ slotRects: rects as IRect[] });
    }).exec();
  },

  onTitleInput(e: WechatMiniprogram.Input) {
    const newTitle = e.detail.value.trim();
    this.setData({ title: newTitle });
    wx.setStorageSync(\'daily_report_title\', newTitle); // 写入缓存
  },

  onBackTap() { wx.navigateBack({ delta: 1 }); },

  onDragStart(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index as number;
    const item = this.data.gridItems[index];
    if (item.id === \'logo\' || !item.src) return;

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
      wx.vibrateShort({ type: \'medium\' });
    }
    if (!this.data.isActuallyDragging) return;

    this.setData({ ghostX: touch.clientX - 50, ghostY: touch.clientY - 50 });

    const currentSlotIndex = gridItems[draggingIndex].slot;

    for (let i = 0; i < slotRects.length; i++) {
      if (i === 4) continue;

      const occupantIdx = gridItems.findIndex(it => it.slot === i);
      if (occupantIdx === draggingIndex) continue;

      const rect = slotRects[i];
      if (touch.clientX > rect.left && touch.clientX < rect.right &&
          touch.clientY > rect.top && touch.clientY < rect.bottom) {

        const newList = [...gridItems];
        const targetRect = slotRects[currentSlotIndex];
        const initialRect = slotRects[occupantIdx];

        newList[occupantIdx].tx = targetRect.left - initialRect.left;
        newList[occupantIdx].ty = targetRect.top - initialRect.top;
        newList[occupantIdx].slot = currentSlotIndex;
        newList[draggingIndex].slot = i;

        wx.vibrateShort({ type: \'light\' });
        this.setData({ gridItems: newList });
        break;
      }
    }
  },

  onDragEnd() {
    if (this.data.draggingIndex === -1) return;
    const sortedList = [...this.data.gridItems].sort((a, b) => a.slot - b.slot);
    sortedList.forEach(item => {
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

  checkHasEmptySlot() {
    const hasEmpty = this.data.gridItems.some(it => it.id !== \'logo\' && !it.src);
    this.setData({ hasEmptySlot: hasEmpty });
  },

  onGridItemTap(e: WechatMiniprogram.TouchEvent) {
    if (this.data.isActuallyDragging) return;
    const index = e.currentTarget.dataset.index as number;
    const item = this.data.gridItems[index];

    if (item.id === \'logo\') {
      this.setData({ showLogoPicker: true });
      return;
    }

    if (item.src) return;

    wx.chooseImage({
      count: 1,
      sizeType: [\'compressed\'],
      sourceType: [\'album\', \'camera\'],
      success: (res) => {
        this.setData({
          [`gridItems[${index}].src`]: res.tempFilePaths[0]
        });
        this.checkHasEmptySlot();
      }
    });
  },

  chooseImages() {
    const emptySlotsCount = this.data.gridItems.filter(it => it.id !== \'logo\' && !it.src).length;
    if (emptySlotsCount === 0) return;

    wx.chooseMedia({
      count: emptySlotsCount,
      mediaType: [\'image\'],
      sizeType: [\'compressed\'],
      sourceType: [\'album\', \'camera\'],
      success: (res) => {
        const paths = res.tempFiles.map(f => f.tempFilePath);
        const newList = [...this.data.gridItems];
        let pathIndex = 0;
        newList.forEach(item => {
          if (item.id !== \'logo\' && !item.src && paths[pathIndex]) {
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
    const index = this.data.gridItems.findIndex(it => it.id === id);
    if (index !== -1) {
      this.setData({
        [`gridItems[${index}].src`]: \'\'
      });
      this.checkHasEmptySlot();
    }
  },

  closeLogoPicker() { this.setData({ showLogoPicker: false }); },
  
  selectLogo(e: WechatMiniprogram.TouchEvent) { 
    const logoIndex = e.currentTarget.dataset.logoIndex as number;
    const logoSrc = this.data.logoList[logoIndex];
    
    this.setData({ 
      currentLogoIndex: logoIndex, 
      showLogoPicker: false,
      \'gridItems[4].src\': logoSrc // 直接更新九宫格数据源，修复白屏
    });
    
    wx.setStorageSync(\'daily_report_logo_index\', logoIndex); // 写入缓存
  },

  async saveGridImage() {
    // BUG 4 修复：增加保存前置校验
    if (!this.data.title) {
      return wx.showToast({ title: \'请输入标题\', icon: \'none\' });
    }
    if (this.data.currentLogoIndex === -1) {
      return wx.showToast({ title: \'请选择一个Logo\', icon: \'none\' });
    }
    if (this.data.gridItems.some(it => it.id !== \'logo\' && !it.src)) {
      return wx.showToast({ title: \'请先填满所有图片格子\', icon: \'none\' });
    }

    const authorized = await checkAndRequestPhotosAlbumScope();
    if (!authorized) return;

    wx.showLoading({ title: \'图片生成中...\', mask: true });

    try {
      const tempFilePath = await this.doImageSynthesis();
      wx.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: () => wx.showToast({ title: \'已保存至相册\', icon: \'success\' }),
        fail: () => wx.showToast({ title: \'保存失败\', icon: \'none\' })\
      });
    } catch (err) {
      console.error(\'图片合成失败\', err);
      wx.showToast({ title: \'图片合成失败，请稍后重试\', icon: \'none\' });
    } finally {
      wx.hideLoading();
    }
  },

  doImageSynthesis(): Promise<string> {
    return new Promise((resolve, reject) => {
      const query = this.createSelectorQuery();
      query.select(\'#gridCanvas\').fields({ node: true, size: true }).exec(async (res) => {
        if (!res[0] || !res[0].node) return reject(new Error(\'获取Canvas节点失败\'));

        const canvas = res[0].node as WechatMiniprogram.Canvas;
        const ctx = canvas.getContext(\'2d\') as WechatMiniprogram.CanvasContext;

        const dpr = wx.getSystemInfoSync().pixelRatio;
        const W = 1242;
        const gridW = 388;
        const gridGap = 8;
        const gridStartX = 31;
        const gridStartY = 280;
        const H = gridStartY + (gridW * 3 + gridGap * 2) + 200;

        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);

        ctx.fillStyle = \'#ffffff\';
        ctx.fillRect(0, 0, W, H);
        
        const { title, currentDate, gridItems, currentLogoIndex, logoList } = this.data;

        const drawCenterText = (text: string, font: string, color: string, y: number) => {
          if (!text) return;
          ctx.font = font;
          ctx.fillStyle = color;
          ctx.textAlign = \'center\';
          ctx.textBaseline = \'top\';
          ctx.fillText(text, W / 2, y);
        };

        drawCenterText(title, \'bold 72px sans-serif\', \'#222222\', 100);
        drawCenterText(currentDate, \'bold 36px sans-serif\', \'#666666\', 200);

        const loadImage = (src: string): Promise<WechatMiniprogram.Image> => new Promise((r, j) => {
          if (!src) return r(null as any);
          const img = canvas.createImage();
          img.src = src;
          img.onload = () => r(img);
          img.onerror = j;
        });

        try {
          const imagePromises = gridItems.map(item => loadImage(item.src));
          const images = await Promise.all(imagePromises);

          for (let i = 0; i < 9; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const x = gridStartX + col * (gridW + gridGap);
            const y = gridStartY + row * (gridW + gridGap);
            const img = images[i];

            if (img) {
              const imgRatio = img.width / img.height;
              const gridRatio = 1;
              let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
              if (imgRatio > gridRatio) {
                sWidth = img.height * gridRatio;
                sx = (img.width - sWidth) / 2;
              } else {
                sHeight = img.width / gridRatio;
                sy = (img.height - sHeight) / 2;
              }
              ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, gridW, gridW);
            } else {
              ctx.fillStyle = \'#f8f8f8\';
              ctx.fillRect(x, y, gridW, gridW);
            }
          }

          drawCenterText(\'专注您的生活\', \'bold 32px sans-serif\', \'#666666\', H - 125);

          setTimeout(() => {
            wx.canvasToTempFilePath({
              canvas,
              success: (res) => resolve(res.tempFilePath),
              fail: reject
            });
          }, 100);

        } catch (err) {
          reject(err);
        }
      });
    });
  },

  noop() { },

  onShareAppMessage() {
    return {
      title: \'快来试试这个超好用的工作日报生成器！\',
      path: \'/pages/index/index\'
    };
  }
});
