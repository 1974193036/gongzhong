// 引入express模块
const express = require('express')

// 创建app应用对象
const app = express()

// sha1加密
const sha1 = require('sha1')

// 验证服务器有效性
/**
 * 1.微信服务器要知道开发者服务器是哪个
 *  -测试号管理页面上（https://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showinfo&t=sandbox/index）填写url开发者服务器地址
 *    -使用ngrok内网穿透，将本地端口号开启的服务映射成外网可以访问的网址
 *    -命令：./ngrok http 3000
 *  -填写token
 *    -参与微信签名加密的一个参数（如atguiguHTML0524）
 * 2.开发者服务器：验证消息是否来自微信服务器，app.use-->接收所有消息 匹配所有的路由，拦截
 *    目的：计算出signature微信加密签名，和微信传过来的signature进行对比，如果一样说明消息来自微信服务器
 *    1.将参与微信加密签名的3个参数（timestamp，nonce，token），按照字典序排序并组合在一起形成一个数组
 *    2.将数组里所有参数拼接成字符串，进行sha1加密
 *    3.加密完成就生成一个signature，和微信发送过来的signature进行对比。
 *      -如果一样说明消息来自微信服务器，返回 echostr 给微信服务器
 *      -如果不一样说明消息不是来自微信服务器，返回 error
 * */

// 定义配置对象
const config = {
  token: 'atguiguHTML0524',
  appID: 'wx8a8012dfba6028f8',
  appsecret: '75810b3ba5883125bc0ca87b5810b35e'
}

// 接收所有消息
app.use((req, res, next) => {
  // 查看微信服务器提交的参数
  console.log(req.query)
  // {
  //  signature: 'eec59ac54c0ab511707b2c4b706ab05d35d8587e', // 微信加密签名
  //  echostr: '4038512498767216612', //微信的随机字符串
  //  timestamp: '1569236964', // 微信发送请求时间戳
  //  nonce: '1792895668' // 微信的随机数字
  // }
  const { signature, echostr, timestamp, nonce } = req.query
  const { token } = config

  // 1
  const arr = [timestamp, nonce, token]
  const arrSort = arr.sort()
  // 2
  const str = arrSort.join('')
  // console.log(str)
  const sha1Str = sha1(str)
  console.log(sha1Str)
  // 3
  if (sha1Str === signature) {
    res.send(echostr)
  } else {
    res.end('error')
  }
})
// app.get('/', (req, res) => {
//   res.send('你好express')
// })

// 监听端口号
app.listen(3000, 'localhost', () => {
  console.log('Server running at http://localhost:3000/')
})