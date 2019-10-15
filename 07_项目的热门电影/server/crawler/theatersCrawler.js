/**
 * 热门电影爬虫
 * */

const puppeteer = require('puppeteer')

// 爬取热门爬虫
const url = 'https://movie.douban.com/cinema/nowplaying/beijing/'

module.exports = async () => {
  // 1、打开浏览器
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'], // 以沙盒的形式打开，在虚拟的沙盒中进行
    headless: true // 默认true：以'无头浏览器'形式打开，没有界面显示，在后台运行的，false：会打开浏览器
  })
  // 2、创建tab页
  const page = await browser.newPage()
  // 3、跳转网址
  await page.goto(url, {
    waitUntil: 'networkidle2' // 等待网络空闲时，再跳转加载页面
  })
  // 4、等网页加载完 爬取数据
  // 如果网络不好，手动延迟 开启一个延迟器 尽量保证页面没问题
  await timeout()
  let result = await page.evaluate(() => {
    // 对加载好的页面 进行dom操作
    // 最终的返回结果
    let result = []
    // 获取所有热门电影的li
    const $list = $('#nowplaying>.mod-bd>.lists>.list-item')
    // 只取8条数据
    for (let i = 0; i < 8; i++) {
      const liDom = $list[i]

      // 页面上引入了jquery，可以使用jquery获取dom
      let title = $(liDom).data('title')
      let rating = $(liDom).data('score')
      let runtime = $(liDom).data('duration')
      let directors = $(liDom).data('director')
      let carts = $(liDom).data('actors')
      let doubanID = $(liDom).data('subject')
      // 电影详情的相应页网址
      let href = $(liDom).find('.poster>a').attr('href')
      // 电影详情的海报图
      let image = $(liDom).find('.poster>a>img').attr('src')

      result.push({
        title,
        rating,
        runtime,
        directors,
        carts,
        href,
        image,
        doubanID
      })
    }

    // 将爬取的数据返回出去
    return result
  })

  // 到详情页拿类型，简介，上映日期
  // 遍历取到的八条数据
  for (let i = 0; i < result.length; i++) {
    // 获取每一个条目信息
    let item = result[i]
    // 获取详情页面的网址
    let url = item.href
    // 跳转到电影详情页（打开8个网页，速度会很慢）
    await page.goto(url, {
      waitUntil: 'networkidle2' // 等待网络空闲时，在加载页面
    })
    // 爬取数据
    let itemResult = await page.evaluate(() => {
      // 类型
      let genre = []
      // 通过属性选择器找到 类型 元素们
      const $genre = $('[property="v:genre"]')
      for (let j = 0; j < $genre.length; j++) {
        genre.push($($genre[j]).html())
      }
      // 简介
      // 去掉文本字符串中所有空白字符
      const summary = $('[property="v:summary"]').html().replace(/\s+/g, '')
      // 上映日期
      const releaseDate = $('[property="v:initialReleaseDate"]')[0].innerText
      return {
        genre,
        summary,
        releaseDate
      }
    })
    // 给单个对象添加属性。
    // 在evaluate函数中没办法读取到服务器中的变量, 服务器中的变量也读不到evaluate中的变量，只能让evaluate返回出来。
    item.genre = itemResult.genre
    item.summary = itemResult.summary
    item.releaseDate = itemResult.releaseDate
  }

  // 5、关闭浏览器
  await browser.close()

  return result
}

function timeout() {
  return new Promise(resolve => setTimeout(resolve, 2000))
}