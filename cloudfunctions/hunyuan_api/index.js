// 云函数入口文件
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const { prompt } = event;
    
    // 调用腾讯混元大模型 API
    const response = await axios({
      method: 'POST',
      url: 'https://hunyuan.tencentcloudapi.com',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_HUNYUAN_API_KEY' // 请替换为您的混元 API Key
      },
      data: {
        model: 'hunyuan-exp',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的旅游博主，擅长撰写详细、实用且吸引人的旅游攻略。请根据用户的需求，以专业旅游博主的身份，生成一篇符合小红书笔记风格的旅游攻略。笔记应包含以下要素：\n1. 醒目的标题\n2. 详细的行程安排\n3. 住宿、交通、美食推荐\n4. 实用小贴士\n5. 精美的结尾总结\n7. 使用小红书常见的表情符号和标签\n请确保内容生动有趣，信息准确，格式美观，符合小红书用户的阅读习惯。'
          },
          {
            role: 'user',
            content: `请以专业旅游博主的身份，为"${prompt}"生成一篇详细的旅游攻略，采用小红书笔记格式。`
          }
        ],
        temperature: 0.7
      }
    });
    
    return {
      content: response.data.choices[0].message.content
    };
  } catch (error) {
    console.error('调用混元模型失败:', error);
    return {
      content: '生成失败，请稍后重试'
    };
  }
};
