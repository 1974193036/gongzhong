// 要保存数据 就要把保存数据的集合引入
// Trailers
const Trailers = require('../../model/Trailers')
/*
 暴露一个方法 谁调用 就 做存储
 */
module.exports = async data => {
  for (let i = 0; i < data.length; i++) {
    let item = data[i];
    //集合方法的特殊性 ，如果不写回调函数，可以改装成Promise,如果保存成功的话 会自动调用reslove方法
    const result = await Trailers.create({    // 要保存的数据  回调函数
      title: item.title,
      rating: item.rating,
      runtime: item.runtime,
      directors: item.directors,
      carts: item.carts,
      doubanID: item.doubanID,
      cover: item.cover,
      image: item.image,
      genre: item.genre,
      summary: item.summary,
      releaseDate: item.releaseDate,
      link: item.link,
    })

    console.log('Trailers数据保存成功')
    // console.log(result);
  }
}