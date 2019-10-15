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
//解决下载临时素材 是流的形式 怎么把流的形式转化回来  rp库没法处理流，只能使用request
const request = require('request')
// 引入menu模块
const menu = require('./menu')
// 引入工具函数
const { writeFileAsync, readFileAsync } = require('../utils/tool')
// 引入api模块
const api = require('../utils/api')
// path模块
const { resolve, join } = require('path')
// fs 模块
const { createReadStream, createWriteStream } = require('fs')

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
    if (this.ticket && this.ticket_expires_in && this.isValidTicket({
        ticket: this.ticket,
        expires_in: this.ticket_expires_in
      })) {
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


  /**
   * 上传临时素材（媒体文件在微信后台保存时间为3天，即3天后media_id失效）
   * @params type 媒体文件类型，分别有图片（image）、语音（voice）、视频（video）和缩略图（thumb）
   * @parmas fileName 要上传的文件名 -----> sucai.jpg
   * @return {promise<any>}
   * */
  uploadTemporaryMaterial(type, fileName) {
    const filePath = resolve(__dirname, '../media', fileName)

    // console.log(filePath) // /demo/微信公众号/公众号/day01/07_项目的热门电影/media/sucai.jpg

    return new Promise(async (resolve, reject) => {
      // 代码错误处理
      try {
        // 获取access_token
        const data = await this.fetchAccessToken()
        // 定义请求地址
        const url = `${api.temporary.upload}access_token=${data.access_token}&type=${type}`

        // 素材要以流的方式导入进来
        const formData = {
          // media的格式 是流的格式
          media: createReadStream(filePath) // 把文件读取成一个流上传
        }

        // 发送请求 rp如果有参数formData，就是以form表单的形式发送参数
        const res = await rp({
          method: 'POST',
          url,
          json: true,
          formData
        })
        resolve(res) // 这里面有media_id 如果用一次的话就这样，如果要用多次，就要把这个media_id保存到数据库中，方便以后获取，这个media_id就是获取下载临时素材的文件名
      } catch (e) {
        // 一旦try中的代码出了问题，就会走catch逻辑，处理错误
        reject('uploadTemporaryMaterial上传临时素材出了问题:' + e)
      }
    })
  }


  /**
   * 获取临时素材，下载文件
   * @params type 媒体文件类型，判断是否是视频文件，分别有图片（image）、语音（voice）、视频（video）和缩略图（thumb）
   * @parmas fileName 把获取的文件流写入到这个文件名 -----> sucai2.jpg
   * @return {promise<any>}
   * */
  getTemporaryMaterial(type, mediaId, fileName) {
    const filePath = resolve(__dirname, '../media', fileName)

    // console.log(filePath) // /demo/微信公众号/公众号/day01/07_项目的热门电影/media/sucai2.jpg

    return new Promise(async (resolve, reject) => {
      // 获取access_token
      const data = await this.fetchAccessToken()
      // 定义请求地址
      let url = `${api.temporary.get}access_token=${data.access_token}&media_id=${mediaId}`
      // 视频文件只支持http协议
      if (type === 'video') {
        url = url.replace('https://', 'http://')
        // 发送请求
        const data = await rp({
          method: 'GET',
          url,
          json: true
        })
        // 返回出去一个url??
        resolve(data)
      } else {
        // 这是个异步方法 得告诉我们什么时候结束 流文件 的结束是on end
        request(url)
          .pipe(createWriteStream(filePath)) // 把获取到的文件流写入到一个文件中
          .once('end', () => { // 文件读取完毕时 ，可读流会自动关闭，一旦关闭触发close事件，从而调用reslove方法，通知外部 文件读取完毕了
            // 告诉用户完了 就行了
            resolve()
          })
      }
    })
  }


  /**
   * 上传永久素材  类型，告诉我上传的是什么东西 要干什么 （永久图片素材新增后，将带有URL返回给开发者，开发者可以在腾讯系域名内使用（腾讯系域名外使用，图片将被屏蔽）
   * 如果是视频的话 还需要body参数
   * @params type 媒体文件类型，分别有图文（news）、图片（image）、语音（voice）、视频（video）和缩略图（thumb）
   * @params materail 要上传的数据
   * @params body
   * */
  uploadPermanmentMaterial(type, material, body) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.getAccessToken()
        let options = {
          method: 'POST',
          json: true
        }
        if (type === 'news') {
          // 上传图文消息
          options.url = `${api.permanment.uploadNews}access_token=${data.access_token}`
          options.body = material // 图文消息要传的数据
        } else if (type === 'image') {
          // 上传图文消息中的图片

          // console.log(join(__dirname, '../media', material)) // /demo/微信公众号/公众号/day01/07_项目的热门电影/media/sucai.jpg

          options.url = `${api.permanment.uploadimg}access_token=${data.access_token}`
          options.formData = {
            media: createReadStream(join(__dirname, '../media', material)) // 把文件读取成一个流上传
          }
        } else {
          // 其他媒体素材的上传
          options.url = `${api.permanment.uploadOthers}access_token=${data.access_token}&type=${type}`
          options.formData = {
            media: createReadStream(join(__dirname, '../media', material)) // 图片的名字，把文件读取成一个流上传
          }
          // 如果是视频素材，需要多提交一个表单
          if (type === 'video') {
            options.body = body
          }
        }
        // 发送请求
        const result = await rp(options)
        // 将返回值返回出去
        resolve(result)
      } catch (e) {
        reject('uploadPermanmentMaterial上传永久素材方法出了问题:' + e)
      }
    })
  }


  /**
   * 获取永久素材 type不同 有的接收的是json  有的接收的是流 要不同处理
   * */
  getPermanmentMaterial(type, mediaId, fileName) {
    return new Promise(async (resolve, reject) => {
      try {
        // 获取access_token
        const data = await this.fetchAccessToken()
        // 定义请求地址
        const url = `${api.permanment.get}access_token=${data.access_token}`
        // 发送请求
        let options = {
          method: 'POST',
          url,
          json: true,
          body: {
            media_id: mediaId
          }
        }
        if (type === 'news' || type === 'video') {
          const data = await rp(options)
          // 返回出去
          resolve(data)
        } else {
          request(options)
            .pipe(createWriteStream(join(__dirname, '../media', fileName)))
            .once('end', resolve)
        }
      } catch (e) {
        // 这里不用reject 而用resolve，是为了 不让程序停下来，reject
        resolve('getPermanmentMaterial 下载永久素材出了问题:' + e)
      }
    })
  }

  /**
   * 上传方法合并成一个  上传素材（包括上传临时和永久）
   * material可以做为文件名，也可以做为上传图文消息时的参数
   * */
  uploadMaterial(type, material, body, isPermanment = true) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.getAccessToken()
        let options = {
          method: 'POST',
          json: true,
          formData: {
            media: createReadStream(join(__dirname, '../media', material)) // 把文件读取成一个流上传
          }
        }
        if (isPermanment) {
          // 上传永久素材
          if (type === 'news') {
            options.url = `${api.permanment.uploadNews}access_token=${data.access_token}`
            options.body = material // 图文消息要传的数据
            options.formData = null
          } else if (type === 'image') {
            options.url = `${api.permanment.uploadimg}access_token=${data.access_token}`
          } else {
            options.url = `${api.permanment.uploadOthers}access_token=${data.access_token}&type=${type}`
            // 如果是视频素材，需要多提交一个表单
            if (type == 'video') {
              options.body = body
            }
          }
        } else {
          // 上传临时素材
          options.url = `${api.temporary.upload}access_token=${data.access_token}&type=${type}`
        }
        // 发送请求
        const result = await rp(options)
        // 将返回值返回出去
        resolve(result)
      } catch (e) {
        reject('uploadMaterial上传素材方法出了问题:' + e)
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


// 测试，上传临时素材
// const w = new Wechat()
// w.uploadTemporaryMaterial('image', 'sucai.jpg').then(res => {
//   // console.log(res)
//   /* res = {
//       type: 'image',
//       media_id: 'P0B-PpAzWDhqsNNNIAUIV3lMKAfLGIbRZRv6DMpKLRmFAtWfw5fM7Wn-bGfUAhUr',
//       created_at: 1571045587
//   } */
// })

// 测试，获取下载临时素材
// const w = new Wechat()
// w.getTemporaryMaterial('image', 'P0B-PpAzWDhqsNNNIAUIV3lMKAfLGIbRZRv6DMpKLRmFAtWfw5fM7Wn-bGfUAhUr', 'sucai2.jpg')


// 测试，上传永久素材
// const w = new Wechat()
// 上传图文消息封面图片获取thumb_media_id
// w.uploadPermanmentMaterial('thumb', 'bear.jpg').then(res => {
//   /* console.log(res)
//      res = {
//        media_id: 'KVEJY4YhgzJBgl3_MHt0ym1dl-X4t6GP8ZQsSlvyj1k',
//        url: 'http://mmbiz.qpic.cn/mmbiz_jpg/2oGo4JhNXle02OLNm3dF9CVPnRSj4kWVNe4gtrCic4p6gt1thVvwyNBv94RQAazq4jut2sOEfVdicUXPibxGfNs9g/0?wx_fmt=jpeg'
//      }
//   */
// })
// 上传图文消息
/*w.uploadPermanmentMaterial('news', {
  // articles: [{
  //   title: '测试上传永久图文素材',
  //   thumb_media_id: 'KVEJY4YhgzJBgl3_MHt0ym1dl-X4t6GP8ZQsSlvyj1k',
  //   show_cover_pic: 1,
  //   content: '测试上传永久图文素材测试上传永久图文素材测试上传永久图文素材',
  //   content_source_url: 'https://www.baidu.com/'
  // }]
  //   articles: [{
  //   title: 'cc',
  //   thumb_media_id: 'KVEJY4YhgzJBgl3_MHt0ym1dl-X4t6GP8ZQsSlvyj1k',
  //   show_cover_pic: 1,
  //   content: `<h1>绿色</h1>
  //             <div><img src="http://mmbiz.qpic.cn/mmbiz_jpg/2oGo4JhNXle02OLNm3dF9CVPnRSj4kWVDD82KzvjhPGqde2b6nzibkL09NB3wFPYk18BB6w6XOtD0ibVKkVjkIBw/0"></div>
  //             <p>结尾处</p>`,
  //   content_source_url: 'https://www.baidu.com/'
  // }]
}).then(res => {
  console.log(res)
  // { media_id: 'KVEJY4YhgzJBgl3_MHt0yuWhrcKtu0dXsyAHUhYX8dY' }
  // { media_id: 'KVEJY4YhgzJBgl3_MHt0ynD8vf2PdXJdJCsGGxLVwRQ' }
}) */
// 上传图文消息内的图片获取URL
// w.uploadPermanmentMaterial('image', 'sucai.jpg').then(res => {
//   console.log(res) // {url: 'http://mmbiz.qpic.cn/mmbiz_jpg/2oGo4JhNXle02OLNm3dF9CVPnRSj4kWVDD82KzvjhPGqde2b6nzibkL09NB3wFPYk18BB6w6XOtD0ibVKkVjkIBw/0'}
// })


// 测试，获取永久素材
// const w = new Wechat()
// 获取图文消息
// w.getPermanmentMaterial('news', 'KVEJY4YhgzJBgl3_MHt0yuWhrcKtu0dXsyAHUhYX8dY').then(res => {
//   console.log(res)
//   /* res = {
//       news_item: [{
//         title: '测试上传永久图文素材',
//         author: '',
//         digest: '测试上传永久图文素材测试上传永久图文素材测试上传永久图文素材',
//         content: '测试上传永久图文素材测试上传永久图文素材测试上传永久图文素材',
//         content_source_url: 'https://www.baidu.com/',
//         thumb_media_id: 'KVEJY4YhgzJBgl3_MHt0ym1dl-X4t6GP8ZQsSlvyj1k',
//         show_cover_pic: 1,
//         url: 'http://mp.weixin.qq.com/s?__biz=MjM5MzM0NzA4MQ==&mid=100000003&idx=1&sn=86e74172c5f13ed443755f818e6ed564&chksm=2699226511eeab73ba4562cad72e0fcc5617204f8bf54c61e7f2b0f6c7265ad05f56097fe3de#rd',
//         thumb_url: 'http://mmbiz.qpic.cn/mmbiz_jpg/2oGo4JhNXle02OLNm3dF9CVPnRSj4kWVNe4gtrCic4p6gt1thVvwyNBv94RQAazq4jut2sOEfVdicUXPibxGfNs9g/0?wx_fmt=jpeg',
//         need_open_comment: 0,
//         only_fans_can_comment: 0
//       }],
//       create_time: 1571104467,
//       update_time: 1571104467 }
//     */
// })
// 获取图片，图片流写入到bear2.jpg内
// w.getPermanmentMaterial('thumb', 'KVEJY4YhgzJBgl3_MHt0ym1dl-X4t6GP8ZQsSlvyj1k', 'bear2.jpg')


module.exports = Wechat
