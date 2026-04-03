Page({
  data: {
    inputValue: '',
    cases: [
      '帮我写一篇厦门鼓浪屿旅游攻略笔记',
      '帮我写一篇丽江一日游攻略笔记',
      '帮我写一篇泰国曼谷包车游笔记'
    ],
    remainingCount: 10,
    maxCount: 10,
    result: '',
    agePickerVisible: false,
    selectedAge: 0,
    currentCompanionType: '',
    showBackToTop: false
  },

  onLoad() {
    // 初始化年龄范围数组（0-100岁）
    const ageRange = [];
    for (let i = 0; i <= 100; i++) {
      ageRange.push(i);
    }
    this.setData({
      ageRange: ageRange
    });
    
    // 添加页面滚动监听
    wx.onPageScroll((res) => {
      // 当页面滚动距离大于 300rpx 时显示返回顶部按钮，否则隐藏
      this.setData({
        showBackToTop: res.scrollTop > 300
      });
    });
  },

  onInputChange(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  // 显示年龄选择器
  showAgePicker(e) {
    const type = e.currentTarget.dataset.type;
    let defaultAge = 0;
    
    // 根据不同类型设置默认年龄
    if (type === 'son' || type === 'daughter') {
      defaultAge = 10;
    } else if (type === 'father' || type === 'mother' || type === 'father1' || type === 'mother1' || type === 'father2' || type === 'mother2') {
      defaultAge = 60;
    }
    
    this.setData({
      agePickerVisible: true,
      currentCompanionType: type,
      selectedAge: defaultAge,
      selectedAgeIndex: defaultAge // 年龄数组的索引就是年龄值
    });
  },

  // 关闭年龄选择器
  closeAgePicker() {
    this.setData({
      agePickerVisible: false
    });
  },

  // 处理年龄选择变化
  onAgeChange(e) {
    const index = e.detail.value;
    this.setData({
      selectedAgeIndex: index,
      selectedAge: this.data.ageRange[index]
    });
  },

  // 确认选择的年龄
  confirmAge() {
    const { currentCompanionType, selectedAge, inputValue } = this.data;
    
    // 根据选择的同行人员类型和年龄，更新输入框内容
    let companionText = '';
    switch (currentCompanionType) {
      case 'son':
        companionText = `带${selectedAge}岁儿子`;
        break;
      case 'daughter':
        companionText = `带${selectedAge}岁女儿`;
        break;
      case 'father':
        companionText = `带${selectedAge}岁爸爸`;
        break;
      case 'mother':
        companionText = `带${selectedAge}岁妈妈`;
      break;
      case 'mother1':
      companionText = `带${selectedAge}岁岳母`;
      break;
      case 'father1':
      companionText = `带${selectedAge}岁岳父`;
      break;
      case 'mother2':
      companionText = `带${selectedAge}岁婆婆`;
      break;
      case 'father2':
      companionText = `带${selectedAge}岁公公`;
      break;
    }
    
    // 更新输入框内容
    let newInputValue = inputValue;
    if (newInputValue) {
      newInputValue += `，${companionText}`;
    } else {
      newInputValue = companionText;
    }
    
    this.setData({
      inputValue: newInputValue,
      agePickerVisible: false
    });
  },

  generate攻略() {
    const { inputValue, remainingCount } = this.data;
    
    if (!inputValue) {
      wx.showToast({
        title: '请输入旅游主题',
        icon: 'none'
      });
      return;
    }

    if (remainingCount <= 0) {
      wx.showToast({
        title: '今日生成次数已用完，明日再来',
        icon: 'none'
      });
      return;
    }

    // 显示加载状态
    wx.showLoading({
      title: '生成中...'
    });

    // --- 方案 1: 调用 DeepSeek API (当前方案) ---
    // this.callDeepSeek(inputValue);

    // --- 方案 2: 调用 腾讯混元 (Hunyuan) API (通过云函数) ---
    this.callHunyuanCloudFunction(inputValue);

    // --- 方案 3: 调用 自有后端模型 API ---
    // this.callCustomBackend(inputValue);

    // 默认执行 腾讯混元 (Hunyuan) API
  },

  // 1. DeepSeek API 调用逻辑
  callDeepSeek(content) {
    const { remainingCount } = this.data;
    wx.request({
      url: 'https://api.deepseek.com/v1/chat/completions',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-d3b0e7a53b2242d4b3b361c42379e8ea' // 建议移至云函数
      },
      data: {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '请根据用户的需求，从专业旅游博主的角度，生成一篇精良实用的旅游攻略。笔记应包含以下要素：\n1. 醒目的标题\n2. 详细的行程安排\n3. 住宿、交通、美食推荐\n4. 实用小贴士\n5. 精美的结尾总结\n7. 使用小红书常见的表情符号和标签\n请确保内容生动有趣，信息准确，格式美观，符合小红书用户的阅读习惯。'
          },
          {
            role: 'user',
            content: `请以专业旅游博主的身份，为"${content}"生成一篇详细的旅游攻略`
          }
        ],
        temperature: 0.7
      },
      success: (res) => {
        wx.hideLoading();
        this.setData({
          remainingCount: remainingCount - 1,
          result: res.data.choices[0].message.content,
          showBackToTop: true // 生成结果后显示返回顶部按钮
        });
        
        // 结果生成后，滚动到结果区域
        setTimeout(() => {
          wx.pageScrollTo({
            selector: '.result-section',
            duration: 500
          });
        }, 100);
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: '生成失败，请重试', icon: 'none' });
      }
    });
  },

  // 2. 腾讯混元 API 调用示例 (推荐通过微信云函数，避免暴露 Key)
  callHunyuanCloudFunction(content) {
    const { remainingCount } = this.data;
    // 假设已在云开发后台创建了名为 'hunyuan_api' 的云函数
    wx.cloud.callFunction({
      name: 'hunyuan_api',
      data: {
        prompt: content
      },
      success: (res) => {
        wx.hideLoading();
        this.setData({
          remainingCount: remainingCount - 1,
          result: res.result.content,
          showBackToTop: true // 生成结果后显示返回顶部按钮
        });
        
        // 结果生成后，滚动到结果区域
        setTimeout(() => {
          wx.pageScrollTo({
            selector: '.result-section',
            duration: 500
          });
        }, 100);
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: '混元生成失败', icon: 'none' });
      }
    });
  },

  // 3. 自有后端或公众号模型调用逻辑
  callCustomBackend(content) {
    const { remainingCount } = this.data;
    wx.request({
      url: 'https://your-api.com/v1/chat', // 替换为您的自有后端地址
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'your-secret-key' // 自有 API 鉴权
      },
      data: {
        query: content,
        userId: 'unique-user-id'
      },
      success: (res) => {
        wx.hideLoading();
        this.setData({
          remainingCount: remainingCount - 1,
          result: res.data.answer // 假设返回字段为 answer
        });
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: '自有模型调用失败', icon: 'none' });
      }
    });
  },

  selectCase(e) {
    const caseText = e.currentTarget.dataset.case;
    this.setData({
      inputValue: caseText
    });
  },

  // 案例库
  caseLibrary: [
    '帮我写一篇厦门鼓浪屿旅游攻略笔记',
    '帮我写一篇丽江一日游攻略笔记',
    '帮我写一篇泰国曼谷包车游笔记',
    '帮我写一篇北京三日游攻略',
    '帮我写一篇三亚海滩度假攻略',
    '帮我写一篇成都美食之旅攻略',
    '帮我写一篇杭州西湖一日游攻略',
    '帮我写一篇西安古城三日游攻略',
    '帮我写一篇大理洱海骑行攻略',
    '帮我写一篇上海迪士尼游玩攻略',
    '帮我写一篇香港购物美食攻略',
    '帮我写一篇日本东京自由行攻略',
    '帮我写一篇韩国首尔五天四晚攻略',
    '帮我写一篇泰国清迈休闲游攻略',
    '帮我写一篇云南香格里拉攻略',
    '帮我写一篇广州美食探店攻略',
    '帮我写一篇深圳科技之旅攻略',
    '帮我写一篇南京历史文化攻略',
    '帮我写一篇苏州园林漫步攻略',
    '帮我写一篇青岛海滨度假攻略',
    '帮我写一篇重庆山城徒步攻略',
    '帮我写一篇武汉樱花观赏攻略',
    '帮我写一篇长沙美食夜市攻略',
    '帮我写一篇哈尔滨冰雪大世界攻略',
    '帮我写一篇桂林山水摄影攻略',
    '帮我写一篇张家界国家森林公园攻略',
    '帮我写一篇敦煌莫高窟文化攻略',
    '帮我写一篇新疆喀纳斯湖攻略',
    '帮我写一篇西藏拉萨朝圣攻略',
    '帮我写一篇内蒙古草原自驾攻略',
    '帮我写一篇新加坡环球影城攻略',
    '帮我写一篇马来西亚吉隆坡攻略',
    '帮我写一篇越南岘港海滩攻略',
    '帮我写一篇法国巴黎浪漫之旅攻略',
    '帮我写一篇意大利罗马古迹攻略'
  ],

  refreshCases() {
    const { cases } = this.data;
    let newCases = [];
    
    // 确保生成的案例与当前显示的不同
    do {
      // 从案例库中随机选择三个不同的案例
      const shuffled = [...this.caseLibrary].sort(() => 0.5 - Math.random());
      newCases = shuffled.slice(0, 3);
    } while (
      // 检查是否与当前案例完全相同
      newCases.length === cases.length &&
      newCases.every((caseItem, index) => caseItem === cases[index])
    );
    
    this.setData({
      cases: newCases
    });

    wx.showToast({
      title: '案例已更新',
      icon: 'success'
    });
  },

  copyResult() {
    const { result } = this.data;
    if (!result) return;
    
    wx.setClipboardData({
      data: result,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      }
    });
  },

  // 返回顶部
  backToTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 500
    });
    
    // 立即隐藏返回顶部按钮
    this.setData({
      showBackToTop: false
    });
  }
});