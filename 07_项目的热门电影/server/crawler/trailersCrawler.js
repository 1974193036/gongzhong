/**
 * movies首页电影爬虫（即将上映电影）
 * */

/*
 movies首页爬虫
 */
const puppeteer = require('puppeteer');

// 爬取首页爬虫
const url = 'https://movie.douban.com/coming';

module.exports = async () => {
  // 1、打开浏览器
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'], //以沙盒的形式打开，在虚拟的沙盒中进行
    headless: true //无头浏览器打开 没有界面
  })
  // 2、创建tab页
  const page = await browser.newPage()
  // 3、跳转网址
  await page.goto(url, {
    waitUntil: 'networkidle2' //等待网络空闲时，在加载页面
  });
  // 4、等网页加载完 爬取数据
  // 如果网络不好，手动延迟 开启一个延迟器 尽量保证页面没问题
  await timeout()
  //（1）这里只是扒取 去详情页的网址
  // console.log('进入了')
  let result = await page.evaluate(() => {
    // 对加载好的页面 进行dom操作
    // 最终的返回结果
    let tempresult = []

    // 获取所有即将上映电影的tr
    const $list = $('.coming_list tbody tr')
    for (let i = 0; i < $list.length; i++) {
      const trDom = $list[i]
      // 获取电影链接  电影名字  想看电影的人数
      let number = parseFloat($($(trDom).find('td').last()).html())
      // console.log(number) //在沙盒浏览器。打开可视模式 console.log中才会显示  在前台的浏览器显示
      // 判断number的大小 才存
      if (number > 100) {
        let href = $($($(trDom).find('td')).eq(1)).find('a').attr('href')
        tempresult.push({
          href
        })
      }
    }
    // 将爬取的数据返回出去
    return tempresult
  })
  // console.log(result)
  let moviesData = []
  //（2）遍历符合条件的预告片网址数组 扒取里面的数据 放在moviesData里面
  for (let i = 0; i < 8; i++) {
    let item = result[i]
    let url = item.href
    // 跳转到电影详情页
    await page.goto(url, {
      waitUntil: 'networkidle2' //等待网络空闲时，在加载页面
    })
    // 爬取数据
    let itemResult = await page.evaluate(() => {
      // 电影的标题
      let title = $('[property="v:itemreviewed"]').html()
      // 电影的导演
      let directors = $('[rel ="v:directedBy"]').html()
      // 电影的封面
      let image = $('[rel ="v:image"]').attr('src')
      // doubanID
      let doubanID = $('.a_show_login.lnk-sharing').attr('share-id')
      // 电影的主演
      let casts = [];
      for (let j = 0; j < 3; j++) {
        casts.push($($('[rel ="v:starring"]')[j]).html())
      }
      // 类型
      let genre = [];
      // 通过属性选择器找到 类型 元素们
      const $genre = $('[property="v:genre"]')
      for (let j = 0; j < $genre.length; j++) {
        genre.push($($genre[j]).html())
      }
      // 简介
      const summary = $('[property="v:summary"]').html().replace(/\s+/g, '')
      // 上映日期
      const releaseDate = $('[property="v:initialReleaseDate"]')[0].innerText
      // 片长
      const runtime = $('[property="v:runtime"]').html()
      // 评分
      const rating = $('[property="v:average"]').html()
      // 预告片的网址
      let href = $('.related-pic-video').attr('href')
      let cover = $('.related-pic-video').css('background-image');
      if (!href) {
        href = 'https://movie.douban.com/trailer/252904/#content';
        cover = 'https://img1.doubanio.com/img/trailer/medium/2569226457.jpg';
      } else {
        cover = cover.split('"')[1].split('?')[0];
      }
      // 封面图
      return {
        title,
        directors,
        image,
        doubanID,
        casts,
        genre,
        summary,
        releaseDate,
        runtime,
        rating,
        href,
        cover
      }
    })
    // 给单个对象添加属性。
    // 在evaluate函数中没办法读取到服务器中的变量 ,服务器中的变量也读不到evaluate中的变量，只能让evaluate返回出来。
    // console.log(itemResult)
    moviesData.push(itemResult);
  }

  // console.log(moviesData.length)
  //（3）扒取预告片video (mp4)
  for (let i = 0; i < moviesData.length; i++) {
    let item = moviesData[i]
    let url = item.href
    // 跳转到电影详情页
    await page.goto(url, {
      waitUntil: 'networkidle2' //等待网络空闲时，在加载页面
    });
    // 爬取电影预告片 给item添加新的的属性
    item.link = await page.evaluate(() => {
      // 电影预告片
      let link = $('video>source').attr('src');
      return link
    })

  }

  // 5、关闭浏览器
  await browser.close()
  // console.log('结果:')
  // console.log(moviesData)
  return moviesData
}

function timeout() {
  return new Promise(resolve => setTimeout(resolve, 2000))
}