/**
 * 菜单模块
 * */
module.exports = {
  'button': [
    {
      'type': 'click',
      'name': '菜单一号',
      'key': 'yihao'  // 是接收用户Click 事件的时候接收的 EventKey。让我们知道这个按钮是干什么用的
    },
    {
      'name': '菜单二号',
      'sub_button': [
        {
          'type': 'view', // 当你点击这个的时候 就会跳转链接
          'name': '搜索',
          'url': 'http://www.baidu.com/'
        },
        // {
        //   'type': 'miniprogram', // 小程序 通过菜单引用
        //   'name': '小程序',
        //   'url': 'http://mp.weixin.qq.com',
        //   'appid': 'wx286b93c14bbf93aa',
        //   'pagepath': 'pages/lunar/index'
        // },
        {
          'type': 'scancode_waitmsg', // 扫码
          'name': '扫码带提示',
          'key': 'rselfmenu_0_0',
        },
        {
          'type': 'scancode_push',
          'name': '扫码推事件',
          'key': '扫码推事件',
        }]
    },
    {
      'name': '菜单三号',
      'sub_button': [
        /*{
            "type": "media_id", //点击按钮会发送一个设置的永久素材的mediaid对应的图片
            "name": "点击按钮发送图片",
            "media_id": "MEDIA_ID1"
        },
        {
            "type": "view_limited",//点击按钮会发送一个设置的永久素材的mediaid对应的图文信息
            "name": "图文消息",
            "media_id": "MEDIA_ID2"
        },*/
        {
          'name': '发送位置',  // 弹出地理位置的选项
          'type': 'location_select',
          'key': 'rselfmenu_2_0'
        },
        {
          'type': 'pic_sysphoto', // 弹出拍照，直接打开摄像头
          'name': '系统拍照发图',
          'key': 'rselfmenu_1_0',
        },
        {
          'type': 'pic_photo_or_album',// 弹出拍照或者相册二选一
          'name': '拍照或者相册发图',
          'key': 'rselfmenu_1_1',
        }
      ]
    }
  ]
}