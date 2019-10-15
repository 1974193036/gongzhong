// 验证服务器有效性模块

// 引入config模块
const config = require('../config')

// sha1加密
const sha1 = require('sha1')

module.exports = () => {
  return (req, res, next) => {
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
  }
}