// 引入 qiniu 模块
const qiniu = require('qiniu')
// 创建各种上传凭证之前，我们需要定义好其中鉴权对象mac：
const accessKey = 'd9w4shqBNnh_d86DPDWcXzBPrRuRtpgQmvREeBie';
const secretKey = 'gyH1fkDC21gxt3PpCjfFzLX9KNTnE8oHLKQbTOlO';
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
// 资源管理相关的操作首先要构建BucketManager对象：所有方法都挂载到bucketManger上
const config = new qiniu.conf.Config();
// config.useHttpsDomain = true;
config.zone = qiniu.zone.Zone_z0;  // Zone_z1 华北, Zone_z0 华东
// bucketManager对象上既有所有的方法了
const bucketManager = new qiniu.rs.BucketManager(mac, config);
// 存储空间的名称
const bucket = 'cc-cloudy';

module.exports = (resUrl, key) => {
  /*
      resUrl网络资源的地址
      bucket 存储空间的名称
      key 是重命名网络资源的名称
      都可以通过参数传递进来
   */

  // var resUrl = 'http://devtools.qiniu.com/qiniu.png';
  // var bucket = bucket;
  // var key = "qiniu.png";
  return new Promise((resolve, reject) => {
    bucketManager.fetch(resUrl, bucket, key, function (err, respBody, respInfo) {
      if (err) { //有问题
        console.log(err);
        //throw err;
        reject('上传七牛方法出了问题' + err);
      } else {
        if (respInfo.statusCode == 200) { //如果没问题
          /*console.log(respBody.key);
          console.log(respBody.hash);
          console.log(respBody.fsize);
          console.log(respBody.mimeType);*/
          console.log('文件上传成功');
          resolve()
        } else {
          console.log(respInfo.statusCode);
          console.log(respBody);
        }
      }
    });
  })
}