interface ICategory {
  id: number;
  name: string;
  iconClass: string;
}

interface ITool {
  id: number;
  name: string;
  desc: string;
  iconColor: string;
  iconType: string;
}

interface IHomeData {
  categories: ICategory[];
  activeCategory: number;
  recentTools: ITool[];
  showAllTools: boolean;
}

Page<IHomeData, WechatMiniprogram.Page.ICustomInstanceMethods> ({
  data: {
    activeCategory: 1,
    showAllTools: false, // 默认不展开
    categories: [
      { id: 1, name: '灵感写作', iconClass: 'icon-quill' },
      { id: 2, name: '趣味图片', iconClass: 'icon-image' },
      { id: 3, name: '便捷生活', iconClass: 'icon-leaf' },
      { id: 4, name: '开发者', iconClass: 'icon-code' },
    ],
    recentTools: [
      { id: 1, name: '工作日报生成', desc: '上传现场工作照，自动生成工作日报！', iconColor: '#FFF4E5', iconType: 'icon-document' },
      { id: 2, name: 'AI 项目起名', desc: '给你的新项目想一个好名字', iconColor: '#E6F7FF', iconType: 'icon-bulb' },
      { id: 3, name: '周末做什么', desc: '不知道玩什么？帮你做个决定', iconColor: '#E6F7FF', iconType: 'icon-game' },
      { id: 4, name: '今天吃什么', desc: '解决你的每日灵魂拷问', iconColor: '#F0F5FF', iconType: 'icon-food' },
      { id: 5, name: '名词解释', desc: '快速了解某个专业名词的含义', iconColor: '#E6F7FF', iconType: 'icon-book' },
      { id: 6, name: '小红书标题', desc: '一键生成小红书风格的标题', iconColor: '#FFF0F5', iconType: 'icon-flower' }
    ]
  },

  onLoad() {
    // 页面加载
  },

  /**
   * @description 切换激活的分类
   * @param e 
   */
  onCategoryTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    this.setData({
      activeCategory: id,
    });
  },

  /**
   * @description 展开/收起全部工具
   */
  onAllToolsTap() {
    this.setData({
      showAllTools: !this.data.showAllTools,
    });
  },

  /**
   * @description 点击某个具体的工具
   * @param e 
   */
  onToolTap(e: WechatMiniprogram.TouchEvent) {
    const { item } = e.currentTarget.dataset as { item: ITool };
    wx.showToast({
      title: `即将打开: ${item.name}`,
      icon: 'none'
    });
    // 后续可接入页面跳转
    // wx.navigateTo({ url: `/pages/tool-detail/index?id=${item.id}` });
  },

  /**
   * @description 点击置顶推荐卡片
   */
  onHeroTap() {
    wx.showToast({
      title: '即将打开: 工作日报生成',
      icon: 'none'
    })
  }
});
