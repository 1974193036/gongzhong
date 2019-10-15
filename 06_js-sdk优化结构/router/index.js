// 引入express模块
const express = require('express')
//  获取Router
const Router = express.Router
// 创建路由器对象
const router = new Router()


// 逻辑
// 引入sha1加密
const sha1 = require('sha1')
// 引入config模块
const config = require('../config')
// 引入reply模块
const reply = require('../reply')
// 引入wechat模块
const Wechat = require('../wechat/wechat')
// 创建wechat的实例对象
const wechat = new Wechat()


// 页面路由
router.get('/search', async (req, res) => {  // 这是一个最基础的路由
  /**
   * 生成js-sdk使用的签名（signature）
   * 1.组合参与签名的4个参数，jsapi_ticket（临时票据），noncestr（随机字符串），timestamp（时间戳），url（当前服务器地址，填写在网页上JS接口安全域名进行配置）
   * 2.将其进行字典序排序，以'&'拼接在一起
   * 3.进行sha1加密，最终生成signature
   * */
    // 临时票据
  const { ticket } = await wechat.fetchTicket()
  // 随机字符串
  const noncestr = ('' + Math.random()).split('.')[1]
  // 时间戳
  const timestamp = Date.now()
  // url当前服务器地址
  const url = config.url
  // 组合
  let arr = [
    `jsapi_ticket=${ticket}`,
    `noncestr=${noncestr}`,
    `timestamp=${timestamp}`,
    `url=${url}/search`] //还得把当前页面的地址拼上去
  const str = arr.sort().join('&') //  xxx=xxx&xxx=xxx&xxx=xxx
  const signature = sha1(str) //生成的 这个signature是给 页面使用
  // console.log(signature) // 73dac920d6882d27f6a069b6bf61d73afe9cc4a4

  res.render('search', { // 默认会在 views 内找模版渲染页面
    signature,
    noncestr,
    timestamp
  })
})

// 首页movie 页面的路由
router.get('/movie', async (req, res) => {
  res.render('movie')
})


// 验证服务器的有效性
router.use(reply())


//暴露出去
module.exports = router