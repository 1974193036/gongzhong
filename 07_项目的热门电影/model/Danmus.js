// 引入mongoose
const mongoose = require('mongoose')
// 获取Scheam 模式对象
const Schema = mongoose.Schema
// 创建约束对象
const danmusSchema = new Schema({
  doubanID: { // 电影的信息
    type: String,
  },
  author: String,
  time: Number,
  text: String,
  color: String,
  type: Number
})
// 创建模型对象
const danmus = mongoose.model('Danmus', danmusSchema)
// 暴露出去
module.exports = danmus