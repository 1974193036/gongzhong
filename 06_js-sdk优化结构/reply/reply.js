/**
 * 处理用户发送的消息类型和内容
 * 决定返回不同的内容给用户
 * */
module.exports = (message) => {
  // message = {
  //   ToUserName: 'gh_4a411c14e377',
  //   FromUserName: 'oCZSnjlrvRxdja4osCIGD-zzZc0A',
  //   CreateTime: '1569465949',
  //   MsgType: 'text',
  //   Content: '11',
  //   MsgId: '22469352293303302'
  // }

  let options = {
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName,
    createTime: Date.now(),
    msgType: 'text',  //设置一个默认的 text
    // content: 'xxxx',
    // mediaId: 'xxxx'
  }

  // 设置默认值
  let content = '未识别的消息'

  // 判断用户发送的消息类型
  if (message.MsgType === 'text') { // 文本
    options.msgType = 'text'
    if (message.Content === '11') {
      content = '你好，11'
    } else if (message.Content === '22') {
      content = '你好，22'
    } else if (message.Content.match('33')) {
      content = '你好，33'
    }
  } else if (message.MsgType === 'image') { // 图片
    options.msgType = 'image'
    options.mediaId = message.MediaId
    // console.log(message.PicUrl)
  } else if (message.MsgType === 'voice') { // 语音
    options.msgType = 'voice'
    options.mediaId = message.MediaId
    // console.log(message.Recognition);
  } else if (message.MsgType === 'location') { // 地理信息
    // msgType默认为text，返回一个文本给用户
    content = `纬度：${message.Location_X};
                经度：${message.Location_Y};
                地图缩放大小：${message.Scale};
                位置信息：${message.Label};
                `
  } else if (message.MsgType === 'event') { // 事件推送
    if (message.Event === 'subscribe') {  // 订阅事件
      content = '欢迎您的关注 \n ' +
        '回复：首页 能看到电影预告片页面\n' +
        '回复：热门 能看到最新最热门的电影\n' +
        '回复：文本 能看到指定的电影信息\n' +
        '回复：语音 能查看指定的电影信息\n' +
        '也可以点击下面的菜单，了解硅谷电影公众号'
      if (message.EventKey === 'xxxxxx') { // 扫描带参数的二维码的关注事件
        // 给xxxxxx加1
        content = '欢迎您的关注 xxxxx'
      } else if (message.EventKey === 'xxxxxx2') {
        // 给xxxxxx2加1
        content = '欢迎您的关注 xxxx2'
      }
    } else if (message.Event === 'unsubscribe') { //取消关注
      console.log('取消关注')
    } else if (message.Event === 'SCAN') {
      console.log('用户已关注过，再扫描二维码关注事件')
    } else if (message.Event === 'LOCATION') { // 这个 公众平台的api控制里面 开启
      options.msgType = 'text'
      content = `纬度：${message.Latitude};
                经度：${message.Longitude};
                精度：${message.Precision};
                `
    } else if (message.Event === 'CLICK') { //  自定义菜单的点击事件
      options.msgType = 'text'
      console.log('推送了click事件')
      // content = '您点击了按钮：' + message.EventKey // EventKey：事件KEY值，与自定义菜单接口中KEY值对应
      if (message.EventKey === 'help') {
        content = '欢迎您的关注 \n ' +
          '回复：首页 能看到电影预告片页面\n' +
          '回复：热门 能看到最新最热门的电影\n' +
          '回复：文本 能看到指定的电影信息\n' +
          '回复：语音 能查看指定的电影信息\n' +
          '也可以点击下面的菜单，了解硅谷电影公众号'
      }
    }
  }

  options.content = content

  return options
}