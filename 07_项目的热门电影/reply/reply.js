/**
 * 处理用户发送的消息类型和内容
 * 决定返回不同的内容给用户
 * */
const db = require('../db');

// 引入url
const { url, qiniuurl, qiniuformat } = require('../config');

// 1、将热门消息查询出来，所以要引入 模型对象
const Theaters = require('../model/Theater'); //有了他 我们就能得到我们想查询的内容


module.exports = async (message) => {
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
    if (message.Content === '热门') {
      // 这里用到了 数据库 所以在app里面 必须引入db 先链接数据库  再启动app
      // 回复用户热门消息，以图文列表的形式
      await db;
      const data = await Theaters.find({}, { title: 1, summary: 1, image: 1, doubanID: 1, posterKey: 1, _id: 0 })
      // console.log(data)
      // 将content 初始化为空数组，方便以后一个个push
      content = []
      // 不设置news类型，他会以为回复数组。设置为news才能回复
      options.msgType = 'news'
      // 通过遍历 将数据添加进去
      for (let i = 0; i < data.length; i++) {
        let item = data[i]
        content.push({
          title: item.title,
          description: item.summary,
          picUrl: `${qiniuurl}${item.posterKey}${qiniuformat}`,
          // picUrl: item.image,
          url: `${url}/detail/${item.doubanID}`
        })
      }

      // console.log(content)

    } else if (message.Content === '首页') {
      options.msgType = 'news'
      content = [{
        title: '硅谷电影首页',
        description: 'guigu dianying shouye',
        picUrl: 'http://pyy3gr84l.bkt.clouddn.com/J8Md1Z3KpK.jpg',
        url: `${url}/movie`
      }]
    } else if (message.Content === '11') {
      content = '你好，11'
    } else if (message.Content === '22') {
      content = '你好，22'
    } else if (message.Content.match('33')) {
      content = '你好，33'
    } else if (message.Content === '图文素材') {
      options.msgType = 'news'
      content = []
      content.push({
        title: '测试上传永久图文素材',
        description: '测试上传永久图文素材测试上传永久图文素材测试上传永久图文素材',
        picUrl: 'http://mmbiz.qpic.cn/mmbiz_jpg/2oGo4JhNXle02OLNm3dF9CVPnRSj4kWVNe4gtrCic4p6gt1thVvwyNBv94RQAazq4jut2sOEfVdicUXPibxGfNs9g/0?wx_fmt=jpeg',
        // picUrl: data.image,
        url: 'http://mp.weixin.qq.com/s?__biz=MjM5MzM0NzA4MQ==&mid=100000003&idx=1&sn=86e74172c5f13ed443755f818e6ed564&chksm=2699226511eeab73ba4562cad72e0fcc5617204f8bf54c61e7f2b0f6c7265ad05f56097fe3de#rd'
      })
    } else {
      let userInputText = message.Content
      // 搜索用户的指定信息   我们从数据库查找
      // 这里用到了 数据库 所以在app里面 必须引入db 先链接数据库  再启动app
      await db;
      const data = await Theaters.findOne({ title: userInputText }, {
        title: 1,
        summary: 1,
        image: 1,
        posterKey: 1,
        doubanID: 1,
        _id: 0
      })
      // console.log(data)
      // 判断data是否有值
      if (data) {
        options.msgType = 'news';
        content = []
        content.push({
          title: data.title,
          description: data.summary,
          picUrl: `${qiniuurl}${data.posterKey}${qiniuformat}`,
          // picUrl: data.image,
          url: `${url}/detail/${data.doubanID}`
        })
      } else {
        content = '您输入的没查找到。'
      }
    }
  } else if (message.MsgType === 'image') { // 图片
    options.msgType = 'image'
    options.mediaId = message.MediaId
    // console.log(message.PicUrl)
  } else if (message.MsgType === 'voice') { // 语音
    options.msgType = 'voice'
    options.mediaId = message.MediaId
    // console.log(message.Recognition) 是个空值？？？
    let userInputText = message.Recognition
    // 搜索用户的指定信息   我们从数据库查找
    // 这里用到了 数据库 所以在app里面 必须引入db 先链接数据库  再启动app
    await db;
    const data = await Theaters.findOne({ title: userInputText }, {
      title: 1,
      summary: 1,
      image: 1,
      doubanID: 1,
      posterKey: 1,
      _id: 0
    })
    // console.log(data)
    // 判断data是否有值
    if (data) {
      options.msgType = 'news'
      content = []
      content.push({
        title: data.title,
        description: data.summary,
        picUrl: `${qiniuurl}${data.posterKey}${qiniuformat}`,
        // picUrl: data.image,
        url: `${url}/detail/${data.doubanID}`
      })
    } else {
      content = message.Recognition
    }
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