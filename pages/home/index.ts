// pages/home/index.ts

interface ICategory {
  id: string;
  name: string;
  iconClass: string;
}

interface ITool {
  id: string;
  name: string;
  desc: string;
  iconColor: string;
  path?: string;
  isHot?: boolean;
  category: string; // 归属分类
  iconType: string; // 图标渲染类型
}

Page({
  data: {
    categories: [
      { id: 'img', name: '图片处理', iconClass: 'icon-img' },
      { id: 'text', name: '提示公告', iconClass: 'icon-text' },
      { id: 'color', name: '还没做好', iconClass: 'icon-color' },
      { id: 'layout', name: '还没做好', iconClass: 'icon-layout' }
    ] as ICategory[],

    allTools: [ // 原始完整列表
      {
        id: 'grid-poster',
        name: '工作日报生成',
        desc: '上传现场工作照，自动生成工作日报！',
        iconColor: '#F2F2F7', // 修改为与其他一致的浅灰
        path: '/pages/index/index',
        category: 'img',
        iconType: 'grid'
      },
      {
        id: 'newlywed-collage',
        name: '新婚业主拼图',
        desc: '上传新婚照片，自动生成拼图！',
        iconColor: '#F2F2F7',
        category: 'img',
        iconType: 'img'
      },
      {
        id: 'color-palette',
        name: '神秘新功能',
        desc: '更多实用的新功能开发中，请不要期待！',
        iconColor: '#F2F2F7',
        category: 'text',
        iconType: 'mystery'
      },
      {
        id: 'qr-beautify',
        name: '神秘新功能',
        desc: '更多实用的新功能开发中，请不要期待！',
        iconColor: '#F2F2F7',
        category: 'layout',
        iconType: 'mystery'
      },
      {
        id: 'mystery-tool',
        name: '神秘新功能',
        desc: '更多实用的新功能开发中，请不要期待！',
        iconColor: '#F2F2F7',
        category: 'color',
        iconType: 'mystery'
      }
    ] as ITool[],
    recentTools: [] as ITool[], // 实际渲染的过滤列表
    showAllTools: false,
    navTop: 0,
    navHeight: 0
  },

  onLoad() {
    const rect = wx.getMenuButtonBoundingClientRect();
    this.setData({
      navTop: rect.top,
      navHeight: rect.height,
      recentTools: this.data.allTools // 初始显示全部
    });
  },

  // 分类点击筛选
  onCategoryTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    const { allTools } = this.data;
    
    // 触觉反馈
    wx.vibrateShort({ type: 'light' });

    let filtered = allTools;
    if (id !== 'all') {
      filtered = allTools.filter(t => t.category === id);
    }

    this.setData({
      activeCategory: id,
      recentTools: filtered,
      showAllTools: true // 筛选时自动展开
    });
  },

  // 展开/收起全部工具
  onAllToolsTap() {
    const isExpanding = !this.data.showAllTools;
    
    if (!isExpanding) {
      // 在 scroll-view 模式下，我们直接利用 scroll-top 属性或者 pageScrollTo (会自动寻找最近的滚动容器)
      wx.pageScrollTo({
        selector: '.list-section',
        duration: 400,
      });
      
      setTimeout(() => {
        this.setData({ showAllTools: false });
      }, 50);
    } else {
      this.setData({ showAllTools: true });
    }
  },

  // 顶部大卡片点击：跳转到核心工具
  onHeroTap() {
    wx.navigateTo({ url: '/pages/index/index' });
  },

  // 分类点击
  onCategoryTap(e: WechatMiniprogram.TouchEvent) {
    const { id, name } = e.currentTarget.dataset;
    wx.showToast({ title: `开发中: ${name}`, icon: 'none' });
  },

  // 工具列表点击
  onToolTap(e: WechatMiniprogram.TouchEvent) {
    const item = e.currentTarget.dataset.item as ITool;
    if (item.path) {
      wx.navigateTo({ url: item.path });
    } else {
      wx.showToast({ title: '即将上线，敬请期待', icon: 'none' });
    }
  },

  // ======================================
  // 核心：分享与转发配置
  // ======================================
  onShareAppMessage() {
    return {
      title: '阿茶工具集',
      path: '/pages/home/index'
    };
  }
});
