// 引入express模块
const express = require('express')

// 创建app应用对象
const app = express()

// 引入auth模块
const auth = require('./wechat/auth')

// 接收所有消息
app.use(auth())

// 监听端口号
app.listen(3000, 'localhost', () => {
  console.log('Server running at http://localhost:3000/')
})