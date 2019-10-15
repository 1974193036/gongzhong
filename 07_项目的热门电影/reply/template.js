/**
 * 用来加工处理最终回复用户消息的模版（xml）
 * */
module.exports = (options) => {
  // options = {
  //   toUserName: 'oCZSnjlrvRxdja4osCIGD-zzZc0A',
  //   fromUserName: 'gh_4a411c14e377',
  //   createTime: 1569467405621,
  //   msgType: 'text',
  //   content: '你好，11' // 动态设置content
  // }

  let replyMessage =
    `<xml>
      <ToUserName><![CDATA[${options.toUserName}]]></ToUserName>
      <FromUserName><![CDATA[${options.fromUserName}]]></FromUserName>
      <CreateTime>${Date.now()}</CreateTime>
      <MsgType><![CDATA[${options.msgType}]]></MsgType>`
  if (options.msgType === 'text') {
    replyMessage += `<Content><![CDATA[${options.content}]]></Content>`
  } else if (options.msgType === 'image') {
    replyMessage += `<Image><MediaId><![CDATA[${options.mediaId}]]></MediaId></Image>`
  } else if (options.msgType === 'voice') {
    replyMessage += `<Voice><MediaId><![CDATA[${options.mediaId}]]></MediaId></Voice>`
  } else if (options.msgType === 'video') {
    replyMessage += `<Video>
                        <MediaId><![CDATA[${options.mediaId}]]></MediaId>
                        <Title><![CDATA[${options.title}]]></Title>
                        <Description><![CDATA[${options.description}]]></Description>
                     </Video>`
  } else if (options.msgType === 'music') {
    replyMessage += `<Music>
                        <Title><![CDATA[${options.title}]]></Title>
                        <Description><![CDATA[${options.description}]]></Description>
                        <MusicUrl><![CDATA[${options.musicUrl}]]></MusicUrl>
                        <HQMusicUrl><![CDATA[${options.hqMusicUrl}]]></HQMusicUrl>
                        <ThumbMediaId><![CDATA[${options.mediaId}]]></ThumbMediaId>
                     </Music>`
  } else if (options.msgType === 'news') {
    // 这里 最麻烦 ，因为中间  item  是循环创建的，
    replyMessage += `<ArticleCount>${options.content.length}</ArticleCount><Articles>`
    // 遍历数据
    options.content.forEach(item => {
      replyMessage += `<item>
                        <Title><![CDATA[${item.title}]]></Title>
                        <Description><![CDATA[${item.description}]]></Description>
                        <PicUrl><![CDATA[${item.picUrl}]]></PicUrl>
                        <Url><![CDATA[${item.url}]]></Url>
                       </item>`
    })
    replyMessage += `</Articles>`
  }

  replyMessage += `</xml>`

  // 最终回复给用户的xml数据
  return replyMessage
}