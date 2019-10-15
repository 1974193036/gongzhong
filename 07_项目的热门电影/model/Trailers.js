// 引入mongoose
const mongoose = require('mongoose')
// 获取Scheam 模式对象
const Schema = mongoose.Schema
// 创建约束对象
const trailersSchema = new Schema({
  title: String,
  rating: Number,
  runtime: String,
  directors: String,
  carts: [String],
  // href:String, 这个只是我们爬取数据的时候用，真正自己的不用
  doubanID: {
    type: Number,
    unique: true
  },
  image: String,
  cover: String,
  genre: [String], // [ '爱情', '奇幻', '古装' ]
  summary: String,
  releaseDate: String,
  link: String,
  posterKey: String, // 海报图片上传到七牛服务器，返回的key值 其实也是七牛服务器上图片的名字，配上七牛图片服务器的url前置，能获取到图片
  coverKey: String, // 视频封面图片 上传到七牛服务器，返回的key值
  videoKey: String, // 预告片视频 上传到七牛服务器，返回的key值
  createTime: {  //通过这个创建时间 能知道这个图片是什么时候的，比如我想七天更新一次
    type: Date,
    default: Date.now()
  }
})

// 创建模型对象
const Trailers = mongoose.model('Trailers', trailersSchema)

// 暴露出去
module.exports = Trailers