// 拿到数据库模块
const db = require('../db');

// 引入正在上映页面爬虫
const theatersCrawler = require('./crawler/theatersCrawler');
const trailersCrawler = require('./crawler/trailersCrawler');

// 保存数据到数据库
const saveTheaters = require('./save/saveTheaters');
const saveTrailers = require('./save/saveTrailers');

// 上传图片到七牛
const uploadToQiniu = require('./qiniu');

// 获取集合
const Theaters = require('../model/Theater');
const Trailers = require('../model/Trailers');


/**
 * 爬虫测试，并且保存数据到数据库
 * */
(async () => {
  // 链接数据库
  await db
  // 爬取数据
  // const datatheaters = await theatersCrawler()
  // console.log(datatheaters)
  // datatheaters = [{
  //   title: '我和我的祖国',
  //   rating: 8.1,
  //   runtime: '155分钟',
  //   directors: '陈凯歌 张一白 管虎 薛晓路 徐峥 宁浩 文牧野',
  //   carts: '黄渤 / 张译 / 韩昊霖',
  //   href: 'https://movie.douban.com/subject/32659890/?from=playing_poster',
  //   image: 'https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2567998580.webp',
  //   doubanID: 32659890,
  //   genre: [
  //     '剧情'
  //   ],
  //   summary: '七位导演分别取材新中国成立70周年以来，祖国经历的无数个历史性经典瞬间。讲述普通人与国家之间息息相关密不可分的动人故事。聚焦大时代大事件下，小人物和国家之间，看似遥远实则密切的关联，唤醒全球华人共同回忆。',
  //   releaseDate: '2019-09-30(中国大陆)'
  // }...]

  // 将爬取的数据保存到数据库中
  // await saveTheaters(datatheaters)

  // const datatrailers = await trailersCrawler()
  // console.log(datatrailers)
  // datatrailers = [ {
  //   title: '空巢也疯狂',
  //   directors: '赵艺然',
  //   image:
  //     'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2565624889.webp',
  //   doubanID: '34790297',
  //   casts: [ '刘长纯', '洪宗义', '马树超' ],
  //   genre: [ '剧情' ],
  //   summary:
  //     '李金刚李老头突然去世的消息在艺术团传开了，大家因为老李在家里停止呼吸三天才被发现的事都感慨不已，纷纷陷入了空巢恐慌。团里的邱顺天终于为大家创办了开放式的自由养老院，那里没有围墙只有欢乐有歌声也有爱情。',
  //   releaseDate: '2019-10-07(中国大陆)',
  //   runtime: '90分钟',
  //   rating: '',
  //   href: 'https://movie.douban.com/trailer/252904/#content',
  //   cover:
  //     'https://img1.doubanio.com/img/trailer/medium/2569226457.jpg',
  //   link:
  //     'http://vt1.doubanio.com/201910051713/fa4c72e310051af5a456395ee0453dbe/view/movie/M/402520904.mp4' }
  //   ...]

  // 将爬取的数据保存到数据库中
  // await saveTrailers(datatrailers)


  // 上传图片或视频到七牛，并且保存资源路径到数据库中
  // await uploadToQiniu('posterKey', Theaters)
  // await uploadToQiniu('coverKey', Trailers)
  // await uploadToQiniu('posterKey', Trailers)
  // await uploadToQiniu('videoKey', Trailers)
})()