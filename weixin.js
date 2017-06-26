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
                // console.log('通过扫描二维码关注，' + message.EventKey + '&&二维码的ticket:' + message.Ticket);
            } else {
                // console.log('普通关注！');
            }
            console.log('普通关注！');
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

        if (content === '1') {
            reply = ' 一帆风顺 '
        } else if (content === '2') {
            reply = ' 二泉映月 '
        } else if (content === '3') {
            reply = ' 三生有幸 '
        } else if (content === '4') {
            reply = ' 四通八达 '
        } else if (content === '5') {
            reply = ' 五湖四海 '
        } else if (content === '6') {
            reply = ' 六六大顺 '
        } else if (content === '7') {
            reply = ' 七个葫芦娃 '
        } else if (content === '8') {
            reply = ' 八面威风 '
        } else if (content === '9') {
            reply = ' 九五至尊 '
        } else if (content === '10') { //回复图文
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
                }
            ]
        } else if (content === 'image') { //回复图片
            var data = yield wechat.uploadMaterial('image', __dirname + '/1.jpg');
            reply = {
                type: 'image',
                mediaId: data.media_id
            }

        } else if (content === 'video') { //回复视频
            var data = yield wechat.uploadMaterial('video', __dirname + '/gravityWall1.mp4');
            // console.log('111111111111111111111');
            // console.log(data);
            // console.log('111111111111111111111');
            reply = {
                type: 'video',
                mediaId: data.media_id,
                title: 'Re:CREATORS OP gravityWall',
                description: '作词：泽野弘之、Tielle\n作曲、编曲：泽野弘之\n歌：SawanoHiroyuki[nZk]:Tielle & Gemie'
            }
        } else if (content === 'music') { //回复音乐
            var data = yield wechat.uploadMaterial('voice', __dirname + '/bangzhu.mp3');
            reply = {
                type: 'music',
                mediaId: data.media_id,
                title: '天龙八部',
                description: '乔帮主自带BGM',
                musicUrl: 'http://www.chenqiao.win/mp3/bangzhu.mp3',
                HQmusicUrl: 'http://www.chenqiao.win/mp3/bangzhu.mp3'
            }
        } else if (content === 'voice') { //回复语音
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
            console.log(data);
            reply = {
                type: 'video',
                mediaId: data.media_id,
                title: 'Re:CREATORS OP gravityWall',
                description: '作词：泽野弘之、Tielle\n作曲、编曲：泽野弘之\n歌：SawanoHiroyuki[nZk]:Tielle & Gemie'
            }
        }
        this.body = reply;

    }
    yield next;

}