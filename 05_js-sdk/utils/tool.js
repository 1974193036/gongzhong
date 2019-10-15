// 引入xml2js，专门将xml数据转换成js对象
const { parseString } = require('xml2js')

// 引入fs
const { writeFile, readFile } = require('fs')

// 引入路径
const { resolve } = require('path')

module.exports = {
  getUserDataAsync(req) {
    /**
     * 获取用户发送的信息，信息以流式数据发送
     * */
    // 因为数据获取 是异步的，我们要保证执行完，所以要在外面包裹一层Promise对象
    return new Promise((resolve, reject) => {
      let xmlData = ''
      req.on('data', data => {
        // 当流式数据传递过来的时候，触发事件，将数据注入到回调函数中，可能流式数据过来多次，我们要把数据拼起来
        // console.log(data)
        // 这个data是一个 buffer类型。要转成字符串 data.toString()
        xmlData += data.toString()
      }).on('end', () => {
        // 当数据接受完毕时，会触发
        resolve(xmlData)
      })
    })
  },
  parseXmlAsync(xmlData) {
    return new Promise((resolve, reject) => {
      parseString(xmlData, { trim: true }, (err, data) => {
        if (!err) {
          resolve(data)
        } else {
          reject('parseString方法除了问题:' + err)
        }
      })
    })
  },
  formatMessage(jsData) {
    // jsData = { xml:
    // { ToUserName: [ 'gh_4a411c14e377' ],
    //   FromUserName: [ 'oCZSnjlrvRxdja4osCIGD-zzZc0A' ],
    //   CreateTime: [ '1569465487' ],
    //   MsgType: [ 'text' ],
    //   Content: [ '11' ],
    //   MsgId: [ '22469343528896999' ] } }
    let message = {}
    // 获取xml对象
    jsData = jsData.xml
    // 为了防止jsData undefind，判断数据是否是一个对象
    if (typeof jsData === 'object') {
      // 遍历对象
      for (let key in jsData) {
        let value = jsData[key]
        // 过滤空数据
        if (Array.isArray(value) && value.length > 0) {
          // 将合法的数据挂载到message对象上
          message[key] = value[0]
        }
      }
    }

    return message
  },

  /**
   * @params data 数据
   * @params fileName 文件名
   * @return {Promise<any>}
   * accessToken 不能直接写，要不不会变成【object】
   * writeFile是异步方法
   * */
  writeFileAsync(data, fileName) {
    data = JSON.stringify(data)
    const filePath = resolve(__dirname, fileName) // 使用绝对路径 解决使用相对路径生成文件目录位置乱跑问题
    return new Promise((resolve, reject) => {
      writeFile(filePath, data, (err) => {
        if (!err) {
          console.log('文件保存成功')
          resolve(data)
        } else {
          console.log('文件保存失败')
          reject('save方法出了问题：' + err)
        }
      })
    })
  },

  /**
   * @params fileName 文件名
   * @return {Promise<any>}
   * readFile是异步方法
   * */
  readFileAsync(fileName) {
    const filePath = resolve(__dirname, fileName)
    return new Promise((resolve, reject) => {
      readFile(filePath, (err, data) => {
        if (!err) {
          console.log('文件读取成功')
          // 将json字符串转换为json对象
          data = JSON.parse(data)
          resolve(data)
        } else {
          console.log('文件读取失败')
          reject('read方法出了问题：' + err)
        }
      })
    })
  }
}