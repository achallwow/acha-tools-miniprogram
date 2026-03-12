// pages/home/index.ts
import { ICategory, ITool } from '../../types/index';

Page({
  data: {
    // 所有分类
    categories: [
      { id: 'img', name: '图片处理', iconClass: 'icon-img' },
      { id: 'text', name: '提示公告', iconClass: 'icon-text' },
      { id: 'color', name: '还没做好', iconClass: 'icon-color' },
      { id: 'layout', name: '还没做好', iconClass: 'icon-layout' }
    ] as ICategory[],

    // 原始工具列表（完整数据）
    allTools: [
      {
        id: 'grid-poster',
        name: '工作日报生成',
        desc: '上传现场工作照，自动生成工作日报！',
        iconColor: '#F2F2F7',
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

    // 经过筛选后，实际在页面渲染的工具列表
    recentTools: [] as ITool[],

    // 是否展开显示所有工具
    showAllTools: false,

    // 顶部导航栏相关的动态距离
    navTop: 0, // 胶囊按钮顶部距离
    navHeight: 0, // 胶囊按钮高度

    // 当前激活的分类ID
    activeCategory: 'all',
  },

  onLoad() {
    const rect = wx.getMenuButtonBoundingClientRect();
    this.setData({
      navTop: rect.top,
      navHeight: rect.height,
      // 页面加载时，默认显示所有工具
      recentTools: this.data.allTools
    });
  },

  /**
   * @description 顶部 Banner 卡片点击事件
   */
  onHeroTap() {
    wx.navigateTo({ url: '/pages/index/index' });
  },

  /**
   * @description 点击分类矩阵中的按钮，用于筛选工具列表
   * @param e 包含 `dataset` 的点击事件对象，`dataset.id` 为分类ID，`dataset.name` 为分类名
   */
  onCategoryTap(e: WechatMiniprogram.TouchEvent) {
    const { id, name } = e.currentTarget.dataset as { id: string; name: string; };

    // wx.showToast({ title: `开发中: ${name}`, icon: 'none' });
    // 触觉反馈，提升交互体验
    wx.vibrateShort({ type: 'light' });

    // 根据点击的分类ID，从 allTools 中筛选出匹配的工具
    const filteredTools = this.data.allTools.filter(tool => tool.category === id);

    this.setData({
      activeCategory: id,
      recentTools: filteredTools,
      // 筛选后默认展开所有，以便用户看到完整的筛选结果
      showAllTools: true
    });
  },

  /**
   * @description 点击“查看全部/收起”按钮，控制工具列表的展开与折叠
   */
  onAllToolsTap() {
    const isCurrentlyExpanded = this.data.showAllTools;

    if (isCurrentlyExpanded) {
      // 如果当前是展开状态，点击后要收起
      // 为了提升体验，在收起前先将页面滚动到列表的头部
      wx.pageScrollTo({
        selector: '.list-section',
        duration: 300,
      });

      // 延迟一小段时间再执行折叠的 setData，等待滚动动画结束
      setTimeout(() => {
        this.setData({ showAllTools: false });
      }, 300);
    } else {
      // 如果当前是折叠状态，点击后直接展开
      this.setData({ showAllTools: true });
    }
  },

  /**
   * @description 点击具体的某个工具卡片
   * @param e 包含 `dataset` 的点击事件对象，`dataset.item` 为被点击的工具对象
   */
  onToolTap(e: WechatMiniprogram.TouchEvent) {
    const tool = e.currentTarget.dataset.item as ITool;
    if (tool.path) {
      wx.navigateTo({ url: tool.path });
    } else {
      wx.showToast({ title: '该功能正在开发中', icon: 'none' });
    }
  },

  /**
   * @description 页面转发配置
   * @returns 分享信息
   */
  onShareAppMessage() {
    return {
      title: '阿茶工具集 - 您的灵感工具箱',
      path: '/pages/home/index',
      // 你可以配置一个自定义的分享图片
      // imageUrl: '/images/share-cover.png' 
    };
  },
});
