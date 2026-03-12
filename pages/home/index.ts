// pages/home/index.ts
// 首页 - 工具导航入口

import { CATEGORIES, TOOLS, SHARE_CONFIG } from '../../constants/index';
import type { Category, Tool, HomePageData } from '../../types/index';

Page({
  data: {
    categories: CATEGORIES as Category[],
    allTools: TOOLS as Tool[],
    recentTools: [] as Tool[],
    showAllTools: false,
    activeCategory: ''
  } as HomePageData,

  onLoad() {
    // 页面加载时，默认显示所有工具
    this.setData({
      recentTools: this.data.allTools
    });
  },

  /**
   * 分类点击处理
   * 点击分类后筛选并显示对应类型的工具
   */
  onCategoryTap(e: WechatMiniprogram.TouchEvent) {
    const { id, name } = e.currentTarget.dataset;
    const { allTools } = this.data;

    // 触觉反馈
    wx.vibrateShort({ type: 'light' });

    // 未实装的分类显示提示
    const unimplementedCategories = ['text', 'color', 'layout'];
    if (unimplementedCategories.includes(id)) {
      wx.showToast({ title: `开发中: ${name}`, icon: 'none' });
      return;
    }

    // 执行筛选
    let filtered = allTools;
    if (id !== 'all') {
      filtered = allTools.filter((t) => t.category === id);
    }

    this.setData({
      activeCategory: id,
      recentTools: filtered,
      showAllTools: true
    });
  },

  /**
   * 展开/收起全部工具
   */
  onAllToolsTap() {
    const isExpanding = !this.data.showAllTools;

    if (!isExpanding) {
      // 收起时滚动到列表区域
      wx.pageScrollTo({
        selector: '.list-section',
        duration: 400
      });

      setTimeout(() => {
        this.setData({ showAllTools: false });
      }, 50);
    } else {
      this.setData({ showAllTools: true });
    }
  },

  /**
   * Hero卡片点击 - 跳转到核心工具
   */
  onHeroTap() {
    wx.navigateTo({ url: '/pages/index/index' });
  },

  /**
   * 工具列表项点击
   */
  onToolTap(e: WechatMiniprogram.TouchEvent) {
    const item = e.currentTarget.dataset.item as Tool;

    if (item.path) {
      wx.navigateTo({ url: item.path });
    } else {
      wx.showToast({ title: '即将上线，敬请期待', icon: 'none' });
    }
  },

  /**
   * 分享配置
   */
  onShareAppMessage() {
    return {
      title: SHARE_CONFIG.title,
      path: SHARE_CONFIG.path
    };
  }
});
