'use strict'

var ejs = require('ejs');
var heredoc = require('heredoc');

// 1 回复文本消息text
// 2 回复图片消息image
// 3 回复语音消息voice
// 4 回复视频消息video
// 5 回复音乐消息music
// 6 回复图文消息news

//将回复消息内容的对象转成xml的格式
var tpl = heredoc(function*() {
    /*
    <xml>
    <ToUserName><![CDATA[<%= toUserName %>]]></ToUserName>
    <FromUserName><![CDATA[<%= fromUserName %>]]></FromUserName>
    <CreateTime><% createTime %></CreateTime>
    <MsgType><![CDATA[<%= msgType %>]]></MsgType>
    <% if(msgType === 'text'){ %>
        <Content><![CDATA[<%= content %>]]></Content>
    <% }else if(msgType === 'image'){ %>
        <Image>
            <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
        </Image>
    <% }else if(msgType === 'voice'){ %>
        <Voice>
            <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
        </Voice>
    <% }else if(msgType === 'video'){ %>
        <Video>
            <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
            <Title><![CDATA[<%= content.title %>]]></Title>
            <Description><![CDATA[<%= content.description %>]]></Description>
        </Video>
    <% }else if(msgType === 'music'){ %>
        <Music>
            <Title><![CDATA[<%= content.title %>]]></Title>
            <Description><![CDATA[<%= content.description %>]]></Description>
            <MusicUrl><![CDATA[<%= content.musicUrl %>]]></MusicUrl>
            <HQMusicUrl><![CDATA[<%= content.HQmusicUrl %>]]></HQMusicUrl>
            <ThumbMediaId><![CDATA[<%= content.mediaId %>]]></ThumbMediaId>
        </Music>
    <% }else if(msgType === 'news'){ %>
        <ArticleCount><%= content.length %></ArticleCount>
        <Articles>
            <% content.forEach(function(item){ %>
                <item>
                    <Title><![CDATA[<%= item.title %>]]></Title>
                    <Description><![CDATA[<%= item.description %>]]></Description>
                    <PicUrl><![CDATA[<%= item.picurl %>]]></PicUrl>
                    <Url><![CDATA[<%= item.url %>]]></Url>
                </item>
            <% }) %>
        </Articles>
    <% } %>
    </xml>;
    */
})

var compiled = ejs.compile(tpl);
console.log(compiled);
exports = module.exports = {
    compiled: compiled
}