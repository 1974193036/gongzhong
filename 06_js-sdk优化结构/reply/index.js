// 验证服务器有效性模块

// sha1加密
const sha1 = require('sha1')

// 引入config模块
const config = require('../config')

// 引入tool模块
const { getUserDataAsync, parseXmlAsync, formatMessage } = require('../utils/tool')

// 引入 reply模块
const reply = require('./reply')

// 引入 template模块
const template = require('./template')


module.exports = () => {
  return async (req, res, next) => {
    // 查看微信服务器提交的参数
    // console.log(req.query)
    // {
    //  signature: 'eec59ac54c0ab511707b2c4b706ab05d35d8587e', // 微信加密签名
    //  echostr: '4038512498767216612', //微信的随机字符串
    //  timestamp: '1569236964', // 微信发送请求时间戳
    //  nonce: '1792895668' // 微信的随机数字
    // }
    const { signature, echostr, timestamp, nonce } = req.query
    const { token } = config
    const sha1Str = sha1([timestamp, nonce, token].sort().join(''))

    /**
     * 微信服务器会发送两种类型的消息给开发者服务器
     * 1.GET请求
     *  -验证服务器的有效性
     * 2.POST请求
     *  -微信服务器会将用户发送的数据以POST请求的方式转发到开发者服务器
     */

    if (req.method === 'GET') {
      if (sha1Str === signature) {
        res.send(echostr)
      } else {
        // 如果不一样
        // console.log('不一样')
        res.end('error')
      }
    } else if (req.method === 'POST') {
      // 验证消息来自于微信服务器
      if (sha1Str !== signature) {
        // 说明消息不是来自微信服务器
        res.end('post err')
      }

      // console.log(req.query)
      // {
      //   signature: '52341330e4ee723d36f0ccb72e17e4a453f785c9',
      //   timestamp: '1569463842',
      //   nonce: '1222818645',
      //   openid: 'oCZSnjlrvRxdja4osCIGD-zzZc0A' // 用户的微信id
      // }


      // 1.接受请求体中的数据，这些数据是流式的
      const xmlData = await getUserDataAsync(req)
      // console.log(xmlData)
      /* <xml>
          <ToUserName><![CDATA[gh_4a411c14e377]]></ToUserName> // 开发者id
          <FromUserName><![CDATA[oCZSnjlrvRxdja4osCIGD-zzZc0A]]></FromUserName> // 用户的openid
          <CreateTime>1569465199</CreateTime> // 发送的时间戳
          <MsgType><![CDATA[text]]></MsgType> // 发送的消息类型
          <Content><![CDATA[11]]></Content> // 发送的内容
          <MsgId>22469336341288129</MsgId> // 消息id，微信服务器会默认保存3天用户发送的消息，通过此id，3天内就能找到消息数据，3天后会被销毁
        </xml>
      */

      // 2.将XML数据解析为json对象
      const jsData = await parseXmlAsync(xmlData)
      // console.log(jsData)
      /* { xml:
         { ToUserName: [ 'gh_4a411c14e377' ],
         FromUserName: [ 'oCZSnjlrvRxdja4osCIGD-zzZc0A' ],
         CreateTime: [ '1569465487' ],
         MsgType: [ 'text' ],
         Content: [ '11' ],
         MsgId: [ '22469343528896999' ] } }
       */

      // 3.格式化方法
      const message = formatMessage(jsData)
      console.log(message)
      /* { ToUserName: 'gh_4a411c14e377',
         FromUserName: 'oCZSnjlrvRxdja4osCIGD-zzZc0A',
         CreateTime: '1569465949',
         MsgType: 'text',
         Content: '11',
         MsgId: '22469352293303302' }
       */

      // 4.简单的自动回复，都要回复xml类型，获取用户发送数据的类型
      /* -如果遇到以下两种情况，微信公众号回话中，向用户发系统提示'该公众号提供的服务出现故障，请稍后再试'
          -1.开发者在5秒内未回复任何内容
          -2.开发者回复了异常数据，比如json数据，字符串，xml数据中有多余的空格等
       */
      let options = reply(message)

      // 5.获取回复模版（看用户操作的是什么类型，还是事件推送）
      let replyMessage = template(options)
      console.log(replyMessage)
      /*
        <xml>
          <ToUserName><![CDATA[oCZSnjlrvRxdja4osCIGD-zzZc0A]]></ToUserName>
          <FromUserName><![CDATA[gh_4a411c14e377]]></FromUserName>
          <CreateTime>1569468094126</CreateTime>
          <MsgType><![CDATA[text]]></MsgType>
          <Content><![CDATA[你好，11]]></Content>
        </xml>
       */

      // 6.返回响应给微信服务器
      res.send(replyMessage)

      // 如果开发者服务器没有返回响应给微信服务器，微信服务器会发送3次请求过来
      // res.end('')
    } else {
      res.end('error')
    }


  }
}