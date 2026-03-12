// pages/index/index.ts
import { IGridItem, IRect } from '../../types/index';
import { checkAndRequestPhotosAlbumScope } from '../../utils/util';

Page({
  data: {
    title: '',
    currentDate: '',
    logoList: ['/static/images/logo1.png', '/static/images/logo2.png', '/static/images/logo3.png'],
    currentLogoIndex: -1,
    showLogoPicker: false,
    navTop: 0,
    navHeight: 0,

    // -- 【核心数据：iOS 级物理偏移拖拽】 --

    // 1. 九宫格所有格子的数据
    gridItems: [
      { id: 'item-0', src: '', tx: 0, ty: 0, slot: 0 },
      { id: 'item-1', src: '', tx: 0, ty: 0, slot: 1 },
      { id: 'item-2', src: '', tx: 0, ty: 0, slot: 2 },
      { id: 'item-3', src: '', tx: 0, ty: 0, slot: 3 },
      { id: 'logo',   src: '', tx: 0, ty: 0, slot: 4 }, // Logo 位固定在中间
      { id: 'item-5', src: '', tx: 0, ty: 0, slot: 5 },
      { id: 'item-6', src: '', tx: 0, ty: 0, slot: 6 },
      { id: 'item-7', src: '', tx: 0, ty: 0, slot: 7 },
      { id: 'item-8', src: '', tx: 0, ty: 0, slot: 8 }
    ] as IGridItem[],

    // 2. 九个坑位的物理位置信息（onload后获取）
    slotRects: [] as IRect[],

    // 3. 拖拽过程中的状态变量
    draggingIndex: -1,   // 当前正在拖拽的 gridItems 的索引
    ghostX: 0, ghostY: 0, // 拖拽镜像的实时位置
    ghostSrc: '',         // 拖拽镜像的图片地址
    touchStartX: 0, touchStartY: 0, // 拖拽起始点
    isActuallyDragging: false, // 是否真正进入拖拽状态（用于区分点击和长按拖拽）

    // 是否还有空的图片格子（用于禁用“多选”按钮）
    hasEmptySlot: true
  },

  onLoad() {
    const rect = wx.getMenuButtonBoundingClientRect();
    const now = new Date();
    this.setData({
      navTop: rect.top,
      navHeight: rect.height,
      currentDate: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`
    });

    // 页面加载后，获取所有格子的物理位置信息，用于后续的碰撞检测
    // 这里使用 setTimeout 是为了确保 WXML 渲染完毕
    setTimeout(() => { this.refreshSlotRects(); }, 300);
  },

  /**
   * @description 使用 SelectorQuery 获取所有 .grid-item 元素的位置信息
   */
  refreshSlotRects() {
    wx.createSelectorQuery().selectAll('.grid-item').boundingClientRect((rects) => {
      this.setData({ slotRects: rects as IRect[] });
    }).exec();
  },

  onTitleInput(e: WechatMiniprogram.Input) { this.setData({ title: e.detail.value.trim() }); },
  onBackTap() { wx.navigateBack({ delta: 1 }); },

  // ===========================================
  // Section: 核心拖拽交互 (物理避让偏移引擎)
  // ===========================================

  /**
   * @description 拖拽开始
   */
  onDragStart(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index as number;
    const item = this.data.gridItems[index];
    if (item.id === 'logo' || !item.src) return; // Logo或空格子不允许拖拽

    const touch = e.touches[0];
    this.setData({
      draggingIndex: index,
      touchStartX: touch.clientX,
      touchStartY: touch.clientY,
      ghostSrc: item.src,
      ghostX: touch.clientX - 50, // 50是ghost元素宽度的一半
      ghostY: touch.clientY - 50,
      isActuallyDragging: false
    });
  },

  /**
   * @description 拖拽过程
   */
  onDragMove(e: WechatMiniprogram.TouchEvent) {
    if (this.data.draggingIndex === -1) return;
    const touch = e.touches[0];
    const { touchStartX, touchStartY, draggingIndex, slotRects, gridItems } = this.data;

    // --- 步骤1: 判断是否满足“开始拖拽”的阈值 ---
    const moveDist = Math.hypot(touch.clientX - touchStartX, touch.clientY - touchStartY);
    if (moveDist > 15 && !this.data.isActuallyDragging) {
      this.setData({ isActuallyDragging: true });
      wx.vibrateShort({ type: 'medium' }); // 震动一下，给用户明确的反馈
    }
    if (!this.data.isActuallyDragging) return;

    // --- 步骤2: 实时更新拖拽镜像的位置 ---
    this.setData({ ghostX: touch.clientX - 50, ghostY: touch.clientY - 50 });

    // --- 步骤3: 核心碰撞检测与“物理挤开”算法 ---
    const currentSlotIndex = gridItems[draggingIndex].slot;

    for (let i = 0; i < slotRects.length; i++) {
      if (i === 4) continue; // Logo 位是固定不动的，跳过检测

      const occupantIdx = gridItems.findIndex(it => it.slot === i);
      if (occupantIdx === draggingIndex) continue; // 不要跟自己检测

      const rect = slotRects[i];
      // 碰撞检测：判断手指是否进入了某个邻居格子的区域
      if (touch.clientX > rect.left && touch.clientX < rect.right &&
          touch.clientY > rect.top && touch.clientY < rect.bottom) {

        const newList = [...gridItems];

        // --- 关键位移计算 ---
        // 邻居(occupant)将要滑向拖拽物原本的坑位(currentSlotIndex)
        const targetRect = slotRects[currentSlotIndex]; // 目标位置
        const initialRect = slotRects[occupantIdx]; // 邻居的初始位置

        // 1. 设置邻居的偏移量，让它“滑”过去
        newList[occupantIdx].tx = targetRect.left - initialRect.left;
        newList[occupantIdx].ty = targetRect.top - initialRect.top;
        newList[occupantIdx].slot = currentSlotIndex; // 逻辑上，邻居占领了拖拽物的老坑位

        // 2. 记录拖拽物的新坑位（它即将占据邻居的老坑位）
        newList[draggingIndex].slot = i;

        wx.vibrateShort({ type: 'light' });
        this.setData({ gridItems: newList });
        break; // 一次只处理一个碰撞，避免混乱
      }
    }
  },

  /**
   * @description 拖拽结束
   */
  onDragEnd() {
    if (this.data.draggingIndex === -1) return;

    // --- 终极数据归位：这是保证状态干净的核心 ---
    // 1. 创建一个新数组，将所有元素按照最新的 slot 编号重新排序
    const sortedList = [...this.data.gridItems].sort((a, b) => a.slot - b.slot);
    // 2. 清空所有元素的视觉偏移量
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

  // ===========================================
  // Section: 图片选择、删除与Logo设置
  // ===========================================

  checkHasEmptySlot() {
    const hasEmpty = this.data.gridItems.some(it => it.id !== 'logo' && !it.src);
    this.setData({ hasEmptySlot: hasEmpty });
  },

  onGridItemTap(e: WechatMiniprogram.TouchEvent) {
    if (this.data.isActuallyDragging) return; // 如果是拖拽结束时的tap，则忽略
    const index = e.currentTarget.dataset.index as number;
    const item = this.data.gridItems[index];

    if (item.id === 'logo') {
      this.setData({ showLogoPicker: true });
      return;
    }

    if (item.src) return; // 如果格子里已经有图，则不响应（删除操作有专门按钮）

    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newList = [...this.data.gridItems];
        newList[index].src = res.tempFilePaths[0];
        this.setData({ gridItems: newList });
        this.checkHasEmptySlot();
      }
    });
  },

  chooseImages() {
    const emptySlotsCount = this.data.gridItems.filter(it => it.id !== 'logo' && !it.src).length;
    wx.chooseMedia({
      count: emptySlotsCount,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const paths = res.tempFiles.map(f => f.tempFilePath);
        const newList = [...this.data.gridItems];
        let pathIndex = 0;
        newList.forEach(item => {
          if (item.id !== 'logo' && !item.src && paths[pathIndex]) {
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
    const newList = [...this.data.gridItems];
    const target = newList.find(it => it.id === id);
    if (target) {
      target.src = '';
    }
    this.setData({ gridItems: newList });
    this.checkHasEmptySlot();
  },

  closeLogoPicker() { this.setData({ showLogoPicker: false }); },
  selectLogo(e: WechatMiniprogram.TouchEvent) { 
    this.setData({ 
      currentLogoIndex: e.currentTarget.dataset.logoIndex as number, 
      showLogoPicker: false 
    });
  },

  // ===========================================
  // Section: Canvas 图片合成与保存
  // ===========================================

  /**
   * @description 主函数：执行图片合成
   * @returns Promise<string> 合成后的图片临时文件路径
   */
  doImageSynthesis(): Promise<string> {
    return new Promise((resolve, reject) => {
      const query = this.createSelectorQuery();
      query.select('#gridCanvas').fields({ node: true, size: true }).exec(async (res) => {
        if (!res[0] || !res[0].node) return reject(new Error('获取Canvas节点失败'));

        // --- 步骤1: 初始化 Canvas ---
        const canvas = res[0].node as WechatMiniprogram.Canvas;
        const ctx = canvas.getContext('2d') as WechatMiniprogram.CanvasContext;

        // --- 步骤2: 定义画布尺寸和布局参数 (高清尺寸) ---
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const W = 1242; // 画布宽度
        const gridW = 388; // 单个格子宽度
        const gridGap = 8; // 格子间距
        const gridStartX = 31; // 九宫格起始X坐标
        const gridStartY = 280; // 九宫格起始Y坐标
        const H = gridStartY + (gridW * 3 + gridGap * 2) + 200; // 总高度

        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);

        // --- 步骤3: 绘制基础背景和文字 ---
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);
        
        const { title, currentDate, gridItems, currentLogoIndex, logoList } = this.data;

        const drawCenterText = (text: string, font: string, color: string, y: number, letterSpacing: number = 0) => {
          if (!text) return;
          ctx.font = font;
          ctx.fillStyle = color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          if (letterSpacing > 0) {
            // ... (省略带字间距的复杂绘制逻辑)
          } else {
            ctx.fillText(text, W / 2, y);
          }
        };

        drawCenterText(title || '工作日报', 'bold 72px sans-serif', '#222222', 100, 10);
        drawCenterText(currentDate, 'bold 36px sans-serif', '#666666', 200, 10);

        // --- 步骤4: 异步加载所有图片资源 ---
        const loadImage = (src: string): Promise<WechatMiniprogram.Image> => new Promise((r, j) => {
          if (!src) return r(null as any);
          const img = canvas.createImage();
          img.src = src;
          img.onload = () => r(img);
          img.onerror = j;
        });

        try {
          const imagePromises = gridItems.map(item => {
            const src = (item.id === 'logo') ? (currentLogoIndex !== -1 ? logoList[currentLogoIndex] : '') : item.src;
            return loadImage(src);
          });
          const images = await Promise.all(imagePromises);

          // --- 步骤5: 循环绘制九宫格图片 ---
          for (let i = 0; i < 9; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const x = gridStartX + col * (gridW + gridGap);
            const y = gridStartY + row * (gridW + gridGap);
            const img = images[i];

            if (img) {
              // 实现 aspectFill 效果的裁剪绘制
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
              // 如果格子为空，则绘制灰色占位背景
              ctx.fillStyle = '#f8f8f8';
              ctx.fillRect(x, y, gridW, gridW);
            }
          }

          // --- 步骤6: 绘制底部Slogan并导出 ---
          drawCenterText('专注您的生活', 'bold 32px sans-serif', '#666666', H - 125, 70);

          setTimeout(() => {
            wx.canvasToTempFilePath({
              canvas,
              success: (res) => resolve(res.tempFilePath),
              fail: reject
            });
          }, 100); // 延迟确保绘制完成

        } catch (err) {
          reject(err);
        }
      });
    });
  },

  /**
   * @description 点击“保存”按钮的入口函数
   */
  async saveGridImage() {
    if (this.data.gridItems.some(it => it.id !== 'logo' && !it.src)) {
      return wx.showToast({ title: '请先填满所有图片格子', icon: 'none' });
    }

    // 1. 检查并请求相册权限
    const authorized = await checkAndRequestPhotosAlbumScope();
    if (!authorized) return;

    wx.showLoading({ title: '图片生成中...', mask: true });

    try {
      // 2. 调用核心合成函数
      const tempFilePath = await this.doImageSynthesis();

      // 3. 保存到相册
      wx.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: () => wx.showToast({ title: '已保存至相册', icon: 'success' }),
        fail: () => wx.showToast({ title: '保存失败', icon: 'none' })
      });
    } catch (err) {
      console.error('图片合成失败', err);
      wx.showToast({ title: '图片合成失败，请稍后重试', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 空函数，用于catchtap阻止事件冒泡
  noop() { },

  onShareAppMessage() {
    return {
      title: '快来试试这个超好用的工作日报生成器！',
      path: '/pages/index/index' // 分享出去的页面
    };
  }
});
