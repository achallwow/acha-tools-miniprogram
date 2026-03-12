Page({
  data: {
    title: '', currentDate: '',
    logoList: ['/static/images/logo1.png', '/static/images/logo2.png', '/static/images/logo3.png'],
    currentLogoIndex: -1, showLogoPicker: false, navTop: 0, navHeight: 0,

    // 【iOS 5.0 物理偏移架构】
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
    ],

    draggingIndex: -1, ghostX: 0, ghostY: 0, ghostSrc: '',
    slotRects: [] as any[], // 存储 9 个坑位的原始 px 坐标
    touchStartX: 0, touchStartY: 0, isActuallyDragging: false,
    hasEmptySlot: true
  },

  onLoad() {
    const rect = wx.getMenuButtonBoundingClientRect();
    const now = new Date();
    this.setData({
      navTop: rect.top, navHeight: rect.height,
      currentDate: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`
    });
    // 捕获 Flex 物理坐标
    setTimeout(() => { this.refreshSlotRects(); }, 1500);
  },

  refreshSlotRects() {
    wx.createSelectorQuery().selectAll('.grid-item').boundingClientRect((rects: any) => {
      this.setData({ slotRects: rects });
    }).exec();
  },

  onTitleInput(e: any) { this.setData({ title: e.detail.value.trim() }); },
  onBackTap() { wx.navigateBack({ delta: 1 }); },

  // ======================================
  // 核心：物理避让偏移引擎 5.0
  // ======================================
  
  onDragStart(e: any) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.gridItems[index];
    if (item.id === 'logo' || !item.src) return;

    const touch = e.touches[0];
    this.setData({
      draggingIndex: index,
      touchStartX: touch.clientX, touchStartY: touch.clientY,
      ghostSrc: item.src,
      ghostX: touch.clientX - 50, ghostY: touch.clientY - 50,
      isActuallyDragging: false
    });
  },

  onDragMove(e: any) {
    if (this.data.draggingIndex === -1) return;
    const touch = e.touches[0];
    const { touchStartX, touchStartY, draggingIndex, slotRects, gridItems } = this.data;

    // 1. 阈值启动
    const moveDist = Math.sqrt(Math.pow(touch.clientX - touchStartX, 2) + Math.pow(touch.clientY - touchStartY, 2));
    if (moveDist > 15 && !this.data.isActuallyDragging) {
      this.setData({ isActuallyDragging: true });
      wx.vibrateShort({ type: 'medium' });
    }
    if (!this.data.isActuallyDragging) return;

    // 2. 镜像同步
    this.setData({ ghostX: touch.clientX - 50, ghostY: touch.clientY - 50 });

    // 3. 【核心物理挤开算法】
    // 找到当前拖拽物本该待的那个坑位编号
    const currentSlotIndex = gridItems[draggingIndex].slot;

    for (let i = 0; i < slotRects.length; i++) {
      if (i === 4) continue; // 锁死 Logo 位

      // 找到目前正在 i 号坑位上“暂住”的那个 item 的数组索引
      const occupantIdx = gridItems.findIndex(it => it.slot === i);
      if (occupantIdx === draggingIndex) continue;

      const rect = slotRects[i];
      // 碰撞检测：手指进入了邻居的中心领地
      if (touch.clientX > rect.left && touch.clientX < rect.right &&
          touch.clientY > rect.top && touch.clientY < rect.bottom) {
        
        const newList = [...gridItems];
        // 【关键位移计算】
        // 邻居 occupantIdx 将要滑向拖拽物原本的坑位 currentSlotIndex
        const targetRect = slotRects[currentSlotIndex]; // 目标位置（物理坐标）
        const initialRect = slotRects[occupantIdx];    // 邻居的出生点

        // 设置邻居的新偏移量
        newList[occupantIdx].tx = targetRect.left - initialRect.left;
        newList[occupantIdx].ty = targetRect.top - initialRect.top;
        newList[occupantIdx].slot = currentSlotIndex; // 逻辑层：邻居占领了旧坑位

        // 设置拖拽物的新偏移量 (逻辑记录，视觉由镜像接管)
        newList[draggingIndex].tx = rect.left - slotRects[draggingIndex].left;
        newList[draggingIndex].ty = rect.top - slotRects[draggingIndex].top;
        newList[draggingIndex].slot = i; // 逻辑层：拖拽物占领了新坑位

        wx.vibrateShort({ type: 'light' });
        this.setData({ gridItems: newList });
        break;
      }
    }
  },

  onDragEnd() {
    if (this.data.draggingIndex === -1) return;
    
    // 【终极数据归位】
    // 按照 slot 编号对数组进行一次性的真实重排，并清空所有偏移量
    const newList = [...this.data.gridItems];
    const sortedList = Array(9).fill(null);
    newList.forEach(item => {
      const it = { ...item, tx: 0, ty: 0 };
      sortedList[item.slot] = it;
    });

    this.setData({ 
      gridItems: sortedList,
      draggingIndex: -1,
      isActuallyDragging: false
    });
    this.checkSlots();
  },

  // 复活多选按钮逻辑
  checkSlots() {
    const emptyCount = this.data.gridItems.filter(it => it.id !== 'logo' && !it.src).length;
    this.setData({ hasEmptySlot: emptyCount > 0 });
  },

  onGridItemTap(e: any) {
    if (this.data.isActuallyDragging) return;
    const i = e.currentTarget.dataset.index;
    const item = this.data.gridItems[i];
    if (item.id === 'logo') { this.setData({ showLogoPicker: true }); return; }
    if (item.src) return;
    wx.chooseImage({
      count: 1,
      success: (res) => {
        const newList = [...this.data.gridItems];
        newList[i].src = res.tempFilePaths[0];
        this.setData({ gridItems: newList });
        this.checkSlots();
      }
    });
  },

  closeLogoPicker() { this.setData({ showLogoPicker: false }); },
  selectLogo(e: any) { this.setData({ currentLogoIndex: e.currentTarget.dataset.logoIndex, showLogoPicker: false }); },
  chooseImages() {
    wx.chooseMedia({
      count: 8, mediaType: ['image'],
      success: (res) => {
        const paths = res.tempFiles.map(f => f.tempFilePath);
        const newList = [...this.data.gridItems];
        let pIdx = 0;
        for (let i = 0; i < 9; i++) {
          if (newList[i].id === 'logo') continue;
          newList[i].src = paths[pIdx] || '';
          pIdx++;
        }
        this.setData({ gridItems: newList });
        this.checkSlots();
      }
    });
  },
  deleteImage(e: any) {
    const id = e.currentTarget.dataset.id;
    const newList = [...this.data.gridItems];
    const target = newList.find(it => it.id === id);
    if (target) target.src = '';
    this.setData({ gridItems: newList });
    this.checkSlots();
  },
  checkAndAuthorizePhotosAlbum(): Promise<boolean> { return new Promise((r) => { wx.getSetting({ success: (res) => { if (res.authSetting['scope.writePhotosAlbum'] === undefined) { wx.authorize({ scope: 'scope.writePhotosAlbum', success: () => r(true), fail: () => r(false) }); } else if (res.authSetting['scope.writePhotosAlbum'] === false) { wx.showModal({ title: '提示', content: '权限需要', confirmText: '去设置', success: (res) => { if (res.confirm) wx.openSetting({ success: (sr) => r(!!sr.authSetting['scope.writePhotosAlbum']) }); else r(false); } }); } else r(true); }, fail: () => r(false) }); }); },
  doImageSynthesis(): Promise<string> {
    return new Promise((resolve, reject) => {
      const query = wx.createSelectorQuery();
      query.select('#gridCanvas').fields({ node: true, size: true }).exec(async (res) => {
        if (!res[0] || !res[0].node) return reject(new Error('Canvas Error'));
        const canvas = res[0].node; const ctx = canvas.getContext('2d');
        const W = 1242; const gridW = 388; const gridH = 388; const gridGap = 8; const gridStartX = 31; const gridStartY = 280;
        const H = gridStartY + (gridH * 3 + gridGap * 2) + 200;
        canvas.width = W; canvas.height = H; ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
        const { title, currentDate, gridItems, currentLogoIndex, logoList } = this.data;
        const drawCenterText = (t: string, f: string, c: string, y: number, s: number = 0) => {
          if (!t) return; ctx.font = f; ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          if (s > 0) { const ch = t.split(''); let tw = 0; ch.forEach((char, i) => { tw += ctx.measureText(char).width; if (i < ch.length - 1) tw += s; }); let cx = (W - tw) / 2; ch.forEach(char => { ctx.fillText(char, cx + ctx.measureText(char).width / 2, y); cx += ctx.measureText(char).width + s; }); } 
          else ctx.fillText(t, W / 2, y);
        };
        drawCenterText(title || '', 'bold 72px sans-serif', '#222222', 100, 10);
        drawCenterText(currentDate, 'bold 36px sans-serif', '#666666', 200, 10);
        const loadImg = (s: string): Promise<any> => new Promise((r, j) => { if (!s) return r(null); const i = canvas.createImage(); i.src = s; i.onload = () => r(i); i.onerror = j; });
        try {
          for (let i = 0; i < 9; i++) {
            const r = Math.floor(i / 3); const c = i % 3;
            const x = gridStartX + c * (gridW + gridGap); const y = gridStartY + r * (gridH + gridGap);
            const item = gridItems[i];
            let src = (item.id === 'logo') ? (currentLogoIndex !== -1 ? logoList[currentLogoIndex] : '') : item.src;
            if (src) {
              const img = await loadImg(src); if (img) {
                const ir = img.width / img.height; const cr = 1; let rw, rh, ox = 0, oy = 0;
                if (ir > cr) { rh = img.height; rw = img.height * cr; ox = (img.width - rw) / 2; }
                else { rw = img.width; rh = img.width / cr; oy = (img.height - rh) / 2; }
                ctx.drawImage(img, ox, oy, rw, rh, x, y, gridW, gridH);
              }
            } else { ctx.fillStyle = '#f8f8f8'; ctx.fillRect(x, y, gridW, gridH); }
          }
          drawCenterText('专注您的生活', 'bold 32px sans-serif', '#666666', H - 125, 70);
          setTimeout(() => { wx.canvasToTempFilePath({ canvas, success: (sr) => resolve(sr.tempFilePath), fail: reject }); }, 100);
        } catch (err) { reject(err); }
      });
    });
  },
  async saveGridImage() {
    if (this.data.gridItems.filter(it => it.id !== 'logo' && !it.src).length > 0) return wx.showToast({ title: '请填满空格', icon: 'none' });
    const authorized = await this.checkAndAuthorizePhotosAlbum(); if (!authorized) return;
    wx.showLoading({ title: '生成中...', mask: true });
    try { const tempFilePath = await this.doImageSynthesis(); wx.saveImageToPhotosAlbum({ filePath: tempFilePath, success: () => wx.showToast({ title: '已保存', icon: 'success' }), fail: () => wx.showToast({ title: '保存失败', icon: 'none' }) }); } 
    catch (err) { wx.showToast({ title: '合成失败', icon: 'none' }); } finally { wx.hideLoading(); }
  },
  noop() { },
  onShareAppMessage() { return { title: '阿茶工具集', path: '/pages/home/index' }; }
});