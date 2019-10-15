// 引入mongoose
const mongoose = require('mongoose')

module.exports = new Promise((resolve, reject) => { // 暴露出去
  // 连接数据库
  mongoose.connect('mongodb://localhost:27017/atguigu_movie', { useNewUrlParser: true })
  // 绑定事件监听 绑定一次性事件监听
  mongoose.connection.once('open', err => { // 数据库是个异步方法 就得弄同步
    if (!err) {
      console.log('数据库连接成功了!')
      resolve() // 将状态改为成功
    } else {
      reject('数据库连接失败：' + err)
    }
  })
})
