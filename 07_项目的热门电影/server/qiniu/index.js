/**
 * 将数据库中的图片 上传到七牛服务器中
 */
// 引入upload 上传七牛
const upload = require('./upload')
// 生成唯一的key值的方法
const nanoid = require('nanoid')

module.exports = async (key, Model) => {
  /*
  1、获取数据库中的图片链接
  2、上传到七牛中（图片链接，key值唯一性）
  3、把生成的七牛key文件名。保存在自己的数据库中
   */
  // 上传的细节，上传过程中可能会失败，如何做到下次上传的时候，以前的不传
  // 我们之前设计过一个字段posterKey，如果上传成功，就会给这个字段赋值。
  // 我们先检查这个字段 是否 空  null 检查存在性。通过 $or表示或者 [] 数组中的某一个值
  // const movies= Theaters.find({posterKey:{$in:['',null,{$exists:false}]}})
  const movies = await Model.find({
    $or: [
      { [key]: '' },
      { [key]: null },
      { [key]: { $exists: false } }
    ]
  })
  // console.log(movies)

  // 遍历每一条数据
  for (let i = 0; i < movies.length; i++) {
    // 获取每一个文档对象
    let movie = movies[i]
    // 获取服务器端的url
    let url = movie.image
    // 文件后缀名
    let filename = '.jpg'
    // 如果是cover 就把url变成cover
    if (key === 'coverKey') {
      url = movie.cover
    } else if (key === 'videoKey') {
      // 如果是video 就把后缀改为MP4
      url = movie.link
      filename = `.mp4`
    }
    filename = `${nanoid(10)}${filename}`
    await upload(url, filename)
    // 把可以只保存在自己的数据库中，以便于在七牛中取到
    movie[key] = filename
    /*mongodb
    insert()直接往库中插入数据，不更新已存在的重复数据。
    save() 往数据库插入数据时，会更新重复的数据。*/
    await movie.save()
  }
}