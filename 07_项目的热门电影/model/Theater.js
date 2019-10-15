// 引入mongoose
const mongoose = require('mongoose')
// 获取Schema 模式对象
const Schema = mongoose.Schema
// 创建约束对象
const theatersSchema = new Schema({
  title: String,
  rating: Number,
  runtime: String,
  directors: String,
  carts: String,
  // href:String, 这个只是我们爬取数据的时候用，真正自己的不用
  doubanID: {
    type: Number,
    unique: true
  },
  image: String,
  genre: [String], // [ '爱情', '奇幻', '古装' ]
  summary: String,
  releaseDate: String,
  posterKey: String, // 图片上传到七牛服务器，返回的key值
  createTime: {  // 通过这个创建时间 能知道这个图片是什么时候的，比如我想七天更新一次
    type: Date,
    default: Date.now()
  }
})
// 创建模型对象
const Theaters = mongoose.model('Theaters', theatersSchema)
// 暴露出去
module.exports = Theaters