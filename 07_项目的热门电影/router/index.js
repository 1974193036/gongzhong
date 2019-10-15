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
// 引入模式对象
const Theaters = require('../model/Theater')
const Trailers = require('../model/Trailers')
const Danmus = require('../model/Danmus')
// db
const db = require('../db')

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
  const timestamp = parseInt(Date.now() / 1000)
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
    timestamp,
    url
  })
})

// 首页movie 页面的路由
router.get('/movie', async (req, res) => {
  // 去数据库中找到对应id值的所有数据。 需要查找数据 就需要引入模式对象theaters
  await db
  let data = await Trailers.find({}, { _id: 0, __v: 0, cover: 0, link: 0, image: 0 })
  // console.log(data)
  data.forEach(item => {
    item.waiwangurl = config.url
    item.posterKeyUrl = `${config.qiniuurl}${item.posterKey}${config.qiniuformat}`
  })
  let waiwangurl = config.url
  res.render('movie', { data, waiwangurl })
})

// 详情页面的路由
router.get('/detail/:id', async (req, res) => {
  // 获取占位符id
  let { id } = req.params
  // 判断id是否存在
  // console.log(id)
  if (id) {
    // 去数据库中找到对应id值的所有数据。 需要查找数据 就需要引入模式对象theaters
    let data = await Theaters.findOne({ doubanID: id }, { _id: 0, __v: 0, createTime: 0 }) // 第一个是条件 第二个是查询结果过滤 1表示查询 0表示不查询
    if (data) {
      data.posterKeyUrl = `${config.qiniuurl}${data.posterKey}${config.qiniuformat}`;
      // console.log(data);
      // 渲染到页面上
      res.render('detail', { data })
    } else {
      res.send('error暂时没有这个页面')
    }
  } else {
    res.send('error暂时没有这个页面')
  }
})

// 加载弹幕的路由
router.get('/v3', async (req, res) => {
  // 获取用户发送过来的请求参数
  const { id } = req.query
  // 去数据库中查找相应的电影弹幕信息
  const data = await Danmus.find({ doubanID: id })
  // const data = [{
  //   time: 3.3964,
  //   type: 0,
  //   color: '#ff0000',
  //   author: 'DIYgod',
  //   text: '1111',
  //   doubanID: '26235346'
  // }, {
  //   time: 4.3964,
  //   type: 0,
  //   color: '#00ff00',
  //   author: 'DIYgod',
  //   text: '2222',
  //   doubanID: '26235346'
  // }]
  /*
      data 是查找的对应id的电影的所有评论，最终我们要返回给用户
      res.send({
          code:0,
          data:[
              []...
          ]
      })的形式
  */
  let resData = []
  data.forEach(item => {
    resData.push([
      item.time,
      item.type,
      item.color,
      item.author,
      item.text
    ])
  })
  // 返回用户响应
  res.send({
    code: 0,
    data: resData
  })
})

// 发送弹幕，接收弹幕入库
router.post('/v3', async (req, res) => {
  // 获取请求参数
  let { id, author, time, text, color, type } = await new Promise((resolve, reject) => {
    let body = ''
    // 接受请求体中的数据，这些数据是流式的
    req.on('data', data => {
      // 接收的数据 类型是buffer，需要调用toString转换
      body += data.toString()
    }).on('end', () => {
      console.log(body)
      // 将json字符串解析成对象
      resolve(JSON.parse(body))
    })
  })
  // 保存到数据库中  保存都库中 就要先建立集合
  await Danmus.create({
    doubanID: id,
    author,
    time,
    text,
    color,
    type
  })
  // 返回响应
  res.send({
    code: 0,
    data: {}
  })
})


// 接口，返回json数据
const bodyParser = require('body-parser')
router.post('/api/getyuyinList', bodyParser.urlencoded({ extended: true }), async (req, res) => {
  const { name } = req.body
  // console.log(req.body) { name: '中国机长' }
  const data = await Theaters.find({ title: name }, {
    title: 1,
    summary: 1,
    image: 1,
    doubanID: 1,
    posterKey: 1,
    _id: 0
  })
  res.json(data)

  /*  let body = ''
      // 接受请求体中的数据，这些数据是流式的
      let dd = req.on('data', data => {
        // 接收的数据 类型是buffer，需要调用toString转换
        body += data.toString()
      }).on('end', () => {
        // console.log(body)
        // 将json字符串解析成对象
        resolve(JSON.parse(body))
      })
      // console.log(dd.body) { name: '中国机长' }
  */
})

router.get('/api/getyuyinList/:name', async (req, res) => {
  const { name } = req.params
  const data = await Theaters.find({ title: name }, {
    title: 1,
    summary: 1,
    image: 1,
    doubanID: 1,
    posterKey: 1,
    _id: 0
  })
  res.json(data)
})


// 验证服务器的有效性
router.use(reply())


//暴露出去
module.exports = router