/**
 * 所有api接口
 * */
const prefix = 'https://api.weixin.qq.com/cgi-bin/'
module.exports = {
  accessToken: `${prefix}token?grant_type=client_credential`,
  ticket: `${prefix}ticket/getticket?type=jsapi`,
  menu: {
    create: `${prefix}menu/create`,
    delete: `${prefix}menu/delete`
  },
  temporary: {
    upload: `${prefix}media/upload?`,
    get: `${prefix}media/get?`
  },
  permanment: {
    uploadNews: `${prefix}material/add_news?`, // 上传图文消息
    uploadimg: `${prefix}media/uploadimg?`, // 上传图文消息内的图片获取URL
    uploadOthers: `${prefix}material/add_material?`, // 新增其他类型永久素材
    get: `${prefix}material/get_material?`
  }
}