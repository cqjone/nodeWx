'use strict'

var config = require('./config');
var Wechat = require('./wechat/wechat');

var wechat = new Wechat(config);

//事件及消息的回复
module.exports.reply = function*(next) {
    var message = this.weixin;

    if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') { //订阅事件：用户未关注时，进行关注后的事件推送
            if (message.EventKey) {
                console.log('通过扫描二维码关注，' + message.EventKey + '&&二维码的ticket:' + message.Ticket);
            } else {
                console.log('普通关注！');
            }
            this.body = '感谢关注！i love you';
        } else if (message.Event === 'unsubscribe') { //取消订阅事件
            console.log('取消关注了!');
            this.body = '';
        } else if (message.Event === 'SCAN') { // 用户已关注时的事件推送
            console.log(' 用户已关注时的事件推送!');
            this.body = '关注后扫描二维码：' + message.EventKey + '/' + message.Ticket;
        } else if (message.Event === 'LOCATION') { //上传地理位置
            console.log('上传地理位置!' + message.FromUserName + '当前的位置是：' + message.Latitude + '/' + message.Longitude + '/' + message.Precision);
            this.body = '';
            //this.body = '你当前的位置是：' + message.Latitude + '/' + message.Longitude + '/' + message.Precision;
        } else if (message.Event === 'CLICK') { //点击了菜单
            console.log('点击了菜单!');
            this.body = '你点击了菜单：' + message.EventKey;
        } else if (message.Event === 'VIEW') { //点击菜单跳转链接
            console.log('点击了菜单!');
            this.body = '你点击了菜单中的连接：' + message.EventKey;
        }
    } else if (message.MsgType === 'text') {
        var content = message.Content;
        var reply = '额....你说的' + message.Content + '太复杂了';
        //回复（1-9文本）
        if (content === '1') { reply = ' 一帆风顺 ' } else if (content === '2') { reply = ' 二泉映月 ' } else if (content === '3') { reply = ' 三生有幸 ' } else if (content === '4') {
            reply = ' 四通八达 '
        } else if (content === '5') { reply = ' 五湖四海 ' } else if (content === '6') { reply = ' 六六大顺 ' } else if (content === '7') { reply = ' 七个葫芦娃 ' } else if (content === '8') { reply = ' 八面威风 ' } else if (content === '9') {
            reply = ' 九五至尊 '
        } else if (content === 'news') { //回复图文

            reply = [{
                title: 'Node',
                description: 'Node.js是一个基于Chrome JavaScript运行时建立的平台， 用于方便地搭建响应速度快、易于扩展的网络应用。Node.js 使用事件驱动， 非阻塞I/O 模型而得以轻量和高效，非常适合在分布式设备上运行数据密集型的实时应用。',
                picurl: 'http://g.hiphotos.baidu.com/baike/w%3D268%3Bg%3D0/sign=daf6a785a1cc7cd9fa2d33df013a4602/42a98226cffc1e17fcdb30594890f603738de976.jpg',
                url: 'http://nodejs.cn/'
            }, {
                title: 'Angular',
                description: 'AngularJS[1]  诞生于2009年，由Misko Hevery 等人创建，后为Google所收购。是一款优秀的前端JS框架，已经被用于Google的多款产品当中。AngularJS有着诸多特性，最为核心的是：MVC、模块化、自动化双向数据绑定、语义化标签、依赖注入等等。',
                picurl: 'http://www.runoob.com/wp-content/uploads/2014/06/angular.jpg',
                url: 'http://www.angularjs.cn/'
            }, {
                title: 'React',
                description: 'React（有时叫React.js或ReactJS）是一个为数据提供渲染为HTML视图的开源JavaScript 库。React视图通常采用包含以自定义HTML标记规定的其他组件的组件渲染。React为程序员提供了一种子组件不能直接影响外层组件（"data flows down"）的模型，数据改变时对HTML文档的有效更新，和现代单页应用中组件之间干净的分离。',
                picurl: 'http://www.runoob.com/wp-content/uploads/2016/02/react.png',
                url: 'https://facebook.github.io/react/'
            }]

        } else if (content === 'image') { //回复图片（上传临时）

            var data = yield wechat.uploadMaterial('image', __dirname + '/1.jpg');
            reply = {
                type: 'image',
                mediaId: data.media_id
            }

        } else if (content === 'video') { //回复视频（上传临时）

            var data = yield wechat.uploadMaterial('video', __dirname + '/gravityWall1.mp4');
            reply = {
                type: 'video',
                mediaId: data.media_id,
                title: 'Re:CREATORS OP gravityWall',
                description: '作词：泽野弘之、Tielle\n作曲、编曲：泽野弘之\n歌：SawanoHiroyuki[nZk]:Tielle & Gemie'
            }

        } else if (content === 'music') { //回复音乐（上传临时）

            var data = yield wechat.uploadMaterial('music', __dirname + '/bangzhu.mp3');
            reply = {
                type: 'music',
                mediaId: data.media_id,
                title: '天龙八部',
                description: '乔帮主自带BGM',
                musicUrl: 'http://www.chenqiao.win/mp3/bangzhu.mp3',
                HQmusicUrl: 'http://www.chenqiao.win/mp3/bangzhu.mp3'
            }

        } else if (content === 'voice') { //回复语音（上传临时）

            var data = yield wechat.uploadMaterial('voice', __dirname + '/yuying.amr');
            reply = {
                type: 'voice',
                mediaId: data.media_id
            }

        } else if (content === 'image0') { //永久图片

            var data = yield wechat.uploadMaterial('image', __dirname + '/1.jpg', { type: 'image' });
            reply = {
                type: 'image',
                mediaId: data.media_id
            }

        } else if (content === 'video0') { //永久视频

            var data = yield wechat.uploadMaterial('video', __dirname + '/gravityWall1.mp4', {
                type: 'video',
                description: '{"title":"Re:CREATORS OP gravityWall forever","introduction":"作词：泽野弘之、Tielle\n作曲、编曲：泽野弘之\n歌：SawanoHiroyuki[nZk]:Tielle & Gemie"}'
            });
            reply = {
                type: 'video',
                mediaId: data.media_id,
                title: 'Re:CREATORS OP gravityWall',
                description: '作词：泽野弘之'
            }

        } else if (content === 'music0') { //永久音乐

            var data = yield wechat.uploadMaterial('music', __dirname + '/bangzhu.mp3', { type: 'music' });
            reply = {
                type: 'music',
                mediaId: data.media_id,
                title: '天龙八部',
                description: '乔帮主自带BGM',
                musicUrl: 'http://www.chenqiao.win/mp3/bangzhu.mp3',
                HQmusicUrl: 'http://www.chenqiao.win/mp3/bangzhu.mp3'
            }

        } else if (content === 'voice0') { //永久语音

            var data = yield wechat.uploadMaterial('voice', __dirname + '/yuying.amr', { type: 'voice' });
            reply = {
                type: 'voice',
                mediaId: data.media_id
            }

        } else if (content === 'news0') { //永久图文
            var picData = yield wechat.uploadMaterial('image', __dirname + '/1.jpg', {});
            reply = {
                type: 'image',
                mediaId: picData.media_id
            }
            console.log('0000000000000000')
            console.log(picData);
            console.log('0000000000000000')
                // var media = {
                //     "articles": [{
                //         "title": '宇宙大爆炸',
                //         "thumb_media_id": picData.media_id,
                //         "author": 'joneco',
                //         "digest": '黑洞的起源',
                //         "show_cover_pic": 1,
                //         "content": '两个超级黑洞的碰撞会发生什么？',
                //         "content_source_url": 'http://baike.baidu.com/link?url=zrpDsQW6RmThdVlo24vXX2RxweoNLPtDeu8F1gCT9GY6Xj5Ds7n2gcOFU7H0x4TeZALVnb0XRV-gl6wdXFXo_waEQvpvlt6P0uJfKq9MWgm'
                //     }]
                // };
                // var data = yield wechat.uploadMaterial('news', media, {});
                // data = yield wechat.getMaterial(data.media_id, 'news', {});
                // console.log('111111111')
                // console.log(data);
                // console.log('111111111')

            // var items = data.news_item;
            // var news = [];

            // items.forEach(function(item) {
            //     news.push({
            //         title: item.title,
            //         description: item.digest,
            //         picurl: picData.url,
            //         url: item.url
            //     })
            // })


            // reply = news;

        } else if (content === 'all') { //获取素材总数。

            var data = yield wechat.getMaterialNum();
            console.log(data)
            reply = '获取素材总数\n视频：' + data.video_count + '\n语音：' + data.voice_count + '\n图片：' + data.image_count + '\n图文：' + data.news_count;

        } else if (new RegExp("^all[a-z]").test(content)) { //获取素材列表。

            var option = { "offset": 0, "count": 10 };
            if (content.substr(3) === 'image') {

                option.type = 'image';
                reply = '有以下永久图片：';

            } else if (content.substr(3) === 'video') {

                option.type = 'video';
                reply = '有以下永久视频：';

            } else if (content.substr(3) === 'voice') {

                option.type = 'voice';
                reply = '有以下永久语音：';

            } else if (content.substr(3) === 'news') {

                option.type = 'news';
                reply = '有以下永久图文：';

            } else {

                reply = '请输入all+想要查询素材的名称。如:allimage';

            }
            var data = yield wechat.getMaterialdetail(option);

            console.log(data)
            data.item.forEach(function(item) {
                if (opoption.type === 'news') {
                    reply += '\n' + item.content.news_item.title;
                } else {
                    reply += '\n' + item.name;
                }

            });
        }
        this.body = reply;

    }
    yield next;

}