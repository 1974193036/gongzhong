/**
 * 获取access_token，
 *  是什么：微信调用接口全局唯一凭证
 *
 *  特点：
 *    1.唯一的
 *    2.有效期2小时（7200秒），提前5分钟请求重新获取access_token
 *    3.接口权限，每天2000次
 *
 *  请求地址：https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
 *  请求方式：GET
 *
 *  设计思路：
 *    1.首次本地没有，发送请求获取access_token，保存下来（本地文件）
 *    2.第二次或以后
 *      -先去本地读取文件，判断它是否过期
 *        -过期：重新请求获取access_token保存下来覆盖之前的文件（保证文件是唯一的）
 *        -没有过期：直接使用
 *
 *  整理思路：
 *    读取本地文件（可以专门定义一个方法读取本地文件，readAccessToken）
 *      -本地有文件
 *         -判断它是否过期（isValidAccessToken）
 *            -过期：重新请求获取access_token（getAccessToken）保存下来覆盖之前的文件（saveAccessToken）（保证文件是唯一的），并使用
 *            -没有过期：直接使用
 *      -本地没有文件
 *         -发送请求获取access_token（getAccessToken），保存下来（本地文件）（saveAccessToken），直接使用
 * */
// 引入fs模块
// const { writeFile, readFile } = require('fs')
// 引入config模块
const { appID, appsecret } = require('../config')
// 只需要引入request-promise-native
const rp = require('request-promise-native')
// 引入menu模块
const menu = require('./menu')
// 引入工具函数
const { writeFileAsync, readFileAsync } = require('../utils/tool')
// 引入api模块
const api = require('../utils/api')

// 定义类，获取access_token
class Wechat {
  constructor() {

  }

  /**
   * 用来获取access_token
   */
  getAccessToken() {
    // 定义请求地址
    const url = `${api.accessToken}&appid=${appID}&secret=${appsecret}`
    // 发送请求
    // 用到两个库：
    // request，
    // request-promise-native，只需要引入request-promise-native，返回值是一个promise对象
    return new Promise((resolve, reject) => {
      rp({
        method: 'GET',
        url: url,
        json: true
      }).then(res => {
        // console.log(res)

        // 设置access_token的过期时间
        res.expires_in = Date.now() + (res.expires_in - 5 * 60) * 1000

        resolve(res)

      }).catch(err => {
        console.log(err)
        reject('getAccessToken方法出了问题：' + err)
      })
    })
  }


  /**
   * 用来保存access_token
   * @params accessToken 要保存的凭据
   */
  saveAccessToken(accessToken) {
    return writeFileAsync(accessToken, 'accessToken.txt')
  }


  /**
   * 用来读取access_token
   */
  readAccessToken() {
    // 读取本地文件中的access_token
    return readFileAsync('accessToken.txt')
  }


  /**
   * 用来检查access_token是否有效
   * @params data
   */
  isValidAccessToken(data) {
    // 检测传入的参数是否是有效的
    if (!data && !data.access_token && !data.expires_in) {
      // 代表access_token无效的
      return false
    }

    // 检测access_token是否在有效期内
    return data.expires_in > Date.now()
  }


  /**
   * 暴露接口，最终获取没有过期的access_token
   * @return {Promise<any>}
   */
  fetchAccessToken() {
    // 优化：先判断 对象上 是否有token 和过期时间 和 这个token是否有效
    if (this.access_token && this.expires_in && this.isValidAccessToken(this)) {
      // 如果有效 就返回一个 promise的成功状态 自己定义一个对象，不直接返回this，因为this上东西太多
      return Promise.resolve({
        access_token: this.access_token,
        expires_in: this.expires_in
      })
    }

    return this.readAccessToken().then(async res => {
      // 说明本地有文件
      // 判断是否过期
      if (this.isValidAccessToken(res)) {
        // 有效的
        return Promise.resolve(res) // Promise {<resolved>: res}
      } else {
        // 无效的，过期了
        // 发送请求获取access_token
        const res = await this.getAccessToken()
        // 保存下来 本地文件
        await this.saveAccessToken(res)
        // 将请求回来的access_token 返回出去
        return Promise.resolve(res)
      }
    }).catch(async err => {
      // 说明本地没有文件
      // 发送请求获取access_token
      const res = await this.getAccessToken()
      // 保存下来 本地文件
      await this.saveAccessToken(res)
      // 将请求回来的access_token 返回出去
      return Promise.resolve(res)
    }).then(res => {
      // 将access_token挂载到this上
      this.access_token = res.access_token
      this.expires_in = res.expires_in
      // 返回res，包装了一层promise对象（并且此对象是成功的状态）
      // 是this.readAccessToken()最终的返回值
      return Promise.resolve(res)
    })
  }


  /**
   * 用来获取jsapi_ticket
   * */
  getTicket() {
    return new Promise(async (resolve, reject) => {
      // 获取access_token
      const data = await this.fetchAccessToken()
      // 定义请求地址
      const url = `${api.ticket}&access_token=${data.access_token}`
      // 发起请求
      rp({
        method: 'GET',
        url: url,
        json: true
      }).then(res => {
        // console.log(res)

        // 设置access_token的过期时间
        res.expires_in = Date.now() + (res.expires_in - 5 * 60) * 1000

        // 将promise的对象状态改为成功的状态
        resolve({
          ticket: res.ticket,
          expires_in: res.expires_in
        })
      }).catch(err => {
        console.log(err)
        reject('getTicket出了问题' + err)
      })
    })
  }


  /**
   * save用来保存 ticket 的方法
   * @params ticket 用来保存的凭据
   * */
  saveTicket(ticket) {
    return writeFileAsync(ticket, 'ticket.txt')
  }


  /**
   * 读取ticket
   * */
  readTicket() {
    return readFileAsync('ticket.txt')
  }


  /**
   * ticket是否有效
   * @params data
   * */
  isValidTicket(data) {
    // 检测传入的参数是否是有效的
    if (!data && !data.ticket && !data.expires_in) {
      // 代表access_token无效的
      return false
    }

    // 检测ticket是否在有效期内
    return data.expires_in > Date.now()
  }

  /**
   * 暴露接口，最终获取没有过期的ticket
   * @return {Promise<any>}
   */
  fetchTicket() {
    // 优化：先判断 对象上 ticket 和过期时间 和 这个ticket是否有效
    if (this.ticket && this.ticket_expires_in && this.isValidTicket({ticket: this.ticket, expires_in: this.ticket_expires_in})) {
      // 如果有效 就返回一个 promise的成功状态 自己定义一个对象，不直接返回this，因为this上东西太多
      return Promise.resolve({
        ticket: this.ticket,
        expires_in: this.ticket_expires_in
      })
    }

    return this.readTicket().then(async res => {
      // 说明本地有文件
      // 判断是否过期
      if (this.isValidTicket(res)) {
        // 有效的
        return Promise.resolve(res) // Promise {<resolved>: res}
      } else {
        // 无效的，过期了
        // 发送请求获取access_token
        const res = await this.getTicket()
        // 保存下来 本地文件
        await this.saveTicket(res)
        // 将请求回来的access_token 返回出去
        return Promise.resolve(res)
      }
    }).catch(async err => {
      // 说明本地没有文件
      // 发送请求获取access_token
      const res = await this.getTicket()
      // 保存下来 本地文件
      await this.saveTicket(res)
      // 将请求回来的access_token 返回出去
      return Promise.resolve(res)
    }).then(res => {
      // 将ticket挂载到this上
      this.ticket = res.ticket
      this.ticket_expires_in = res.expires_in
      // 返回res包装了一层promise对象（此对象是成功的状态）
      // 是this.readTicket()最终的返回值
      return Promise.resolve(res)
    })
  }


  /**
   * 用来创建自定义菜单
   * @params menu 菜单配置对象
   * @return {promise<any>}
   */
  createMenu(menu) {
    // 发送请求，异步请求，
    // 为了保证它能够顺利的执行下去，执行完之后再执行下面的
    // 我们套路就是包装一层promise对象
    return new Promise(async (resolve, reject) => {
      try {
        // 获取 access_token
        let data = await this.fetchAccessToken()
        const url = `${api.menu.create}?access_token=${data.access_token}`
        // rp 库发请求
        let result = await rp({
          method: 'POST',
          url,
          json: true,
          body: menu //请求体
        })
        resolve(result) // {"errcode":0,"errmsg":"ok"}
      } catch (err) {
        reject('creatMenu方法出了问题：' + err)
      }
    })
  }


  /**
   * 用来删除你自定义菜单
   * @return {promise<any>}
   * */
  deleteMenu() {
    return new Promise(async (resolve, reject) => {
      try {
        // 获取 access_token
        let data = await this.fetchAccessToken()
        //定义请求地址
        let url = `${api.menu.delete}?access_token=${data.access_token}`
        //发送请求
        const result = await rp({
          method: 'GET',
          url,
          json: true
        })
        resolve(result) // {"errcode":0,"errmsg":"ok"}
      } catch (e) {
        reject('deleteMenu方法出了问题：' + e)
      }
    })
  }
}


// 模拟测试
// const w = new Wechat()
// w.getAccessToken().then(res => {
//   console.log(res)
// })
// w.getAccessToken()会打印出
// {
//   access_token:'25_CHvexWVc_elKpJm0CyLnjd7_3lcNFqE0oiueJ-Yktg-hLg2p1q6hz7dx8NsFqs9WZPIgqtwpdckgkpb-c9LWeFtKHV6_eqpHkICB6x8cjlRl0c41G7jjM8TeotBlZEuk182UlqDSGGNkZKbFZQCeAHAVMY',
//   expires_in: 7200
// }
// w.getAccessToken().then(...)打印出的expires_in为1569386361501

// w.readAccessToken().then(data => {
//   console.log(data)
// }).catch(() => {
//
// })

// 模拟实现过程
// const p = new Promise((resolve, reject) => {
//   w.readAccessToken().then(res => {
//     // 说明本地有文件
//     // 判断是否过期
//     if (w.isValidAccessToken(res)) {
//       // 有效的
//       resolve(res)
//     } else {
//       // 无效的，过期了
//       w.getAccessToken().then(res => {
//         w.saveAccessToken(res).then(() => {
//           resolve(res)
//         })
//       })
//     }
//
//   }).catch(err => {
//     // 说明本地没有文件
//     w.getAccessToken().then(res => {
//       w.saveAccessToken(res).then(() => {
//         resolve(res)
//       })
//     })
//   })
// })
// p.then(res => {
//   // 最终获取到access_token
//   console.log(res)
// })


// 测试，最终获取到access_token
// const w = new Wechat()
// w.fetchAccessToken().then(res => {
//   console.log(res)
// })

// 测试 最终的菜单删除，创建
// (async () => {
//   const w = new Wechat()
//   let result = await w.deleteMenu()
//   console.log('删除：')
//   console.log(result)
//   result = await w.createMenu(menu)
//   console.log('创建：')
//   console.log(result)
// })()


// 测试，最终获取到ticket
// const w = new Wechat()
// w.fetchTicket().then(res => {
//   console.log(res)
//   /* { ticket: 'bxLdikRXVbTPdHSM05e5uz-gqxFKTz6xig4KD6aBkMTJfTPuJEm7QmmagDGCLmOzT0X20zAUVgCgpuL0wijDhw',
//       expires_in: 1569747470776 }
//    */
// })


module.exports = Wechat
