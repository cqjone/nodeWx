'use strict'

var config = require('./config');
var Wechat = require('./wechat/wechat');

var wechat = new Wechat(config);

//事件及消息的回复
module.exports.reply = function*(next) {
    var message = this.weixin;
    var reply = '';

    if (message.MsgType === 'event') { //事件推送
        if (message.Event === 'subscribe') { //订阅事件：用户未关注时，进行关注后的事件推送
            if (message.EventKey) {
                console.log('通过扫描二维码关注，' + message.EventKey + '&&二维码的ticket:' + message.Ticket);
            } else {
                console.log('普通关注！');
            }
            reply = '感谢关注！i love you';
        } else if (message.Event === 'unsubscribe') { //取消订阅事件
            console.log('取消关注了!');
            reply = message.FromUserName + '取消关注了';
        } else if (message.Event === 'LOCATION') { //上传地理位置
            console.log('上传地理位置!' + message.FromUserName + '当前的位置是：' + message.Latitude + '/' + message.Longitude + '/' + message.Precision);
            // reply = '你当前的位置是：' + message.Latitude + '/' + message.Longitude + '/' + message.Precision;
        } else if (message.Event === 'SCAN') { // 用户已关注时的事件推送
            console.log(' 用户已关注时的事件推送!');
            reply = '关注后扫描二维码：' + message.EventKey + '/' + message.Ticket;
        } else if (message.Event === 'CLICK') { //点击了菜单
            console.log('点击了菜单!');
            reply = '你点击了菜单：' + message.EventKey;
        } else if (message.Event === 'VIEW') { //点击菜单跳转链接
            console.log('你点击了菜单中的连接!');
            reply = '你点击了菜单中的连接：' + message.EventKey;
        } else if (message.Event === 'scancode_push') { //扫码推事件的事件推送
            console.log(message);
            reply = '扫码推事件的事件推送：' + message.ScanCodeInfo;
        } else if (message.Event === 'scancode_waitmsg') { //扫码推事件且弹出“消息接收中”提示框的事件推送
            console.log(message);
            reply = '扫码推事件的事件推送：' + message.ScanCodeInfo;
        } else if (message.Event === 'pic_sysphoto') { //弹出系统拍照发图的事件推送
            console.log(message);
            reply = '扫码推事件的事件推送：' + message.SendPicsInfo;
        } else if (message.Event === 'pic_photo_or_album') { //弹出拍照或者相册发图的事件推送
            console.log(message);
            reply = '扫码推事件的事件推送：' + message.SendPicsInfo;
        } else if (message.Event === 'pic_weixin') { //弹出微信相册发图器的事件推送
            console.log(message);
            reply = '扫码推事件的事件推送：' + message.SendPicsInfo;
        } else if (message.Event === 'location_select') { //弹出地理位置选择器的事件推送
            console.log(message);
            reply = '扫码推事件的事件推送：' + message.SendLocationInfo;
        }
    } else if (message.MsgType === 'image') { //接收用户的图片消息并回复
        console.log(message);
        reply = '图片';
    } else if (message.MsgType === 'voice') { //接收用户的语音消息并回复
        console.log(message);
        reply = '声音';
    } else if (message.MsgType === 'video') { //接收用户的视频消息并回复
        console.log(message);
        reply = '视频';
    } else if (message.MsgType === 'shortvideo') { //接收用户的小视频消息并回复
        console.log(message);
        reply = '小视频';
    } else if (message.MsgType === 'link') { //接收用户的连接消息并回复
        console.log(message);
        reply = '链接';
    } else if (message.MsgType === 'location') { //接收用户的地理位置消息并回复
        console.log(message);
        reply = '地理位置';
    } else if (message.MsgType === 'text') { //接收用户的文本消息并回复
        console.log('////////////////////////////////');
        console.log(message);
        console.log('////////////////////////////////');
        var content = message.Content;

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
            // console.log('/////////////////////');
            // console.log(data);
            // console.log('/////////////////////');
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
            // reply = {
            //     type: 'image',
            //     mediaId: picData.media_id
            // }

            var media = {
                "articles": [{
                    "title": '宇宙大爆炸',
                    "thumb_media_id": picData.media_id,
                    "author": 'joneco',
                    "digest": '黑洞的起源',
                    "show_cover_pic": 1,
                    "content": '两个超级黑洞的碰撞会发生什么？',
                    "content_source_url": 'http://baike.baidu.com/link?url=zrpDsQW6RmThdVlo24vXX2RxweoNLPtDeu8F1gCT9GY6Xj5Ds7n2gcOFU7H0x4TeZALVnb0XRV-gl6wdXFXo_waEQvpvlt6P0uJfKq9MWgm'
                }, {
                    "title": '宇宙大爆炸1',
                    "thumb_media_id": picData.media_id,
                    "author": 'joneco1',
                    "digest": '黑洞的起源1',
                    "show_cover_pic": 1,
                    "content": '两个超级黑洞的碰撞会发生什么？',
                    "content_source_url": 'http://baike.baidu.com/link?url=zrpDsQW6RmThdVlo24vXX2RxweoNLPtDeu8F1gCT9GY6Xj5Ds7n2gcOFU7H0x4TeZALVnb0XRV-gl6wdXFXo_waEQvpvlt6P0uJfKq9MWgm'
                }]
            };
            var data = yield wechat.uploadMaterial('news', media, {});
            data = yield wechat.getMaterial(data.media_id, 'news', {});

            var items = data.news_item;
            var news = [];

            items.forEach(function(item) {
                news.push({
                    title: item.title,
                    description: item.digest,
                    picurl: picData.url,
                    url: item.url
                })
            })


            reply = news;

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
            console.log('获取素材');
            console.log(data)


            data.item.forEach(function(item) {
                reply += '\n' + item.media_id;
            });
            reply += '\n共' + data.item_count + '项';


        } else if (new RegExp("^del[a-z]").test(content)) { //删除素材(每次最后一个)

            var option = { "offset": 0, "count": 10 };
            if (content.substr(3) === 'image') {
                option.type = 'image';
                reply = '删除图片：';
            } else if (content.substr(3) === 'video') {
                option.type = 'video';
                reply = '删除视频：';
            } else if (content.substr(3) === 'voice') {
                option.type = 'voice';
                reply = '删除语音：';
            } else if (content.substr(3) === 'news') {
                option.type = 'news';
                reply = '删除图文：';
            } else {
                reply = '请输入del+想要想要素材的名称。如:allimage';
            }
            var data = yield wechat.getMaterialdetail(option);
            var mediaId = data.item[data.item_count - 1].media_id
            console.log(mediaId);
            var req = yield wechat.delMaterialdetail(mediaId);
            console.log(req);
            reply += mediaId + '成功';

        } else if (content === 'tag') { //标签管理。
            //创建管理员标签
            // var tag1 = yield wechat.creatTag('管理员');
            // console.log('创建管理员标签');
            // console.log(tag1);
            //获取标签列表
            var tags = yield wechat.getTags();
            console.log('获取标签列表');
            console.log(tags);
            var fans = yield wechat.userTagGet(tags.tags[1].id);
            console.log(fans);
            //给自己打个标签
            // var msg = yield wechat.tagBatchtagging([message.FromUserName], tag1.tag.id);
            // console.log('给自己打个标签');
            // console.log(msg);

            reply = '用户标签管理';

        } else if (content === 'me') { //查看自己的信息。
            var data = yield wechat.getUserInfo(message.FromUserName);
            var sex = data.sex == 1 ? '男' : '女';
            console.log(data);
            reply = '您的微信信息有：\n姓名：' + data.nickname + '\n性别：' + sex + '\n城市：' + data.province + '省-' + data.city + '市';

        } else if (content === 'fans') { //查看粉丝列表。
            var data = yield wechat.getUsersList();
            console.log('/////////////////');
            console.log(data);
            console.log('/////////////////');
            // var code = yield wechat.tagBatchtagging(data.data.openid, 100);
            // console.log(code);
            reply = '粉丝有：\n' + data.count + '个';
        } else if (content === 'sendall') { //群发
            var tags = yield wechat.getTags();
            console.log('获取标签列表');
            console.log(tags);

            // var data = yield wechat.uploadMaterial('video', __dirname + '/gravityWall1.mp4', {
            //     type: 'video',
            //     description: '{"title":"Re:CREATORS OP gravityWall forever","introduction":"作词：泽野弘之、Tielle\n作曲、编曲：泽野弘之\n歌：SawanoHiroyuki[nZk]:Tielle & Gemie"}'
            // });

            // console.log('上传视频');
            // console.log(data);
            // console.log('/////////////////');

            // var data = yield wechat.uploadMaterial('image', __dirname + '/1.jpg', { type: 'image' });

            var data1 = yield wechat.tagMass(tags.tags[1].id, 'text', '群发消息');
            // console.log('群发');
            // console.log(data1);
            // console.log('/////////////////');
            // var code = yield wechat.tagBatchtagging(data.data.openid, 100);
            // console.log(code);
            // reply = '粉丝有：\n' + data.count + '个';
        } else if (content === '创建菜单') { //创菜单
            var delall = yield wechat.delMenu();
            var data = yield wechat.createMenu(config.menu);
            console.log('////创建菜单////');
            console.log(data);
            console.log('/////////////////');
        } else if (content === '删除菜单') { //删菜单
            var data = yield wechat.delMenu();
            console.log('////删除菜单////');
            console.log(data);
            console.log('/////////////////');
        } else if (content === '创建菜单123') { //创个性化菜单
            // var delall = yield wechat.delMenu();

            var data = yield wechat.createPersonalMenu(config.personalMenu);
            console.log('////创建菜单123////');
            console.log(data);
            console.log('/////////////////');
        } else if (content === '删除菜单123') { //删个性化菜单
            var menu = yield wechat.getMenu();
            var data = yield wechat.delPersonalMenu(menu.menuid);
            console.log('////删除菜单123////');
            console.log(data);
            console.log('/////////////////');
        }
    }
    this.body = reply;
    yield next;

}