// 引入express模块
const express = require('express')

// 引入router模块
const router=require('./router')

// 创建app应用对象
const app = express()

// 设置ejs模版引擎
app.set('view engine', 'ejs')

// 设置模板资源目录，可写可不写，默认会在 views 内找模版
app.set('views', './views')

// 应用路由器
app.use(router)
// 页面路由
// app.get('/search', async (req, res) => {
//   /**
//    * 生成js-sdk使用的签名（signature）
//    * 1.组合参与签名的4个参数，jsapi_ticket（临时票据），noncestr（随机字符串），timestamp（时间戳），url（当前服务器地址，填写在网页上JS接口安全域名进行配置）
//    * 2.将其进行字典序排序，以'&'拼接在一起
//    * 3.进行sha1加密，最终生成signature
//    * */
//   // 临时票据
//   const { ticket } = await wechat.fetchTicket()
//   // 随机字符串
//   const noncestr = ('' + Math.random()).split('.')[1]
//   // 时间戳
//   const timestamp = Date.now()
//   // url当前服务器地址
//   const url = config.url
//   // 组合
//   let arr = [
//     `jsapi_ticket=${ticket}`,
//     `noncestr=${noncestr}`,
//     `timestamp=${timestamp}`,
//     `url=${url}/search`] //还得把当前页面的地址拼上去
//   const str = arr.sort().join('&') //  xxx=xxx&xxx=xxx&xxx=xxx
//   const signature = sha1(str) //生成的 这个signature是给 页面使用
//   // console.log(signature) // 73dac920d6882d27f6a069b6bf61d73afe9cc4a4
//
//   res.render('search', { // 默认会在 views 内找模版渲染页面
//     signature,
//     noncestr,
//     timestamp
//   })
// })
//
// // 接收所有消息
// app.use(auth())

// 监听端口号
app.listen(3000, 'localhost', () => {
  console.log('Server running at http://localhost:3000/')
})