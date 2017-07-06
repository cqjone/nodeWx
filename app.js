'use strict'

var koa = require('koa'); //koa服务

var path = require('path');

var ejs = require('ejs');

var heredoc = require('heredoc');

var crypto = require('crypto');

var wechat_g = require('./wechat/generator');

var wechat = require('./wechat/wechat');

var util = require('./libs/util');

var config = require('./config'); //配置文件

var weixin = require('./weixin');

var wechat_file = path.join(__dirname, './config/wechat.txt');

var tpl = heredoc(function() {
    /*
    <!DOCTYPE HTML>
    <head>
    	<meta charset = "utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        
    	<title>js-SDK</title>
    </head>
    <body>
        <button id="chooseImage">选择图片</button>
        <button id="start">开始录音</button>
        <button id="end">结束录音</button>
        <p id="title"></p>
        <p id="doctor"></p>
        <p id="year"></p>
        <p id="poster"></p>

        <script type="text/javascript" src="http://www.zeptojs.cn/zepto.min.js"></script>
        <script type="text/javascript" src="http://res.wx.qq.com/open/js/jweixin-1.2.0.js"></script>
        <script type="text/javascript">
        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: 'wx60ed01dc892a54fc', // 必填，公众号的唯一标识
            timestamp: '<%= timestamp %>', // 必填，生成签名的时间戳
            nonceStr: '<%= noncestr %>', // 必填，生成签名的随机串
            signature: '<%= signature %>',// 必填，签名，见附录1
            jsApiList: [
                'onMenuShareTimeline',      //“分享到朋友圈”按钮点击状态及自定义分享内容接口
                'onMenuShareAppMessage',    //“分享给朋友”按钮点击状态及自定义分享内容接口
                'onMenuShareQQ',            //“分享到QQ”按钮点击状态及自定义分享内容接口
                'onMenuShareWeibo',         //“分享到腾讯微博”按钮点击状态及自定义分享内容接口
                'onMenuShareQZone',         //“分享到QQ空间”按钮点击状态及自定义分享内容接口
                'startRecord',              //开始录音接口
                'stopRecord',               //停止录音接口
                'onVoiceRecordEnd',         //监听录音自动停止接口
                'playVoice',                //播放语音接口
                'pauseVoice',               //暂停播放接口
                'stopVoice',                //停止播放接口
                'onVoicePlayEnd',           //监听语音播放完毕接口
                'uploadVoice',              //上传语音接口
                'downloadVoice',            //下载语音接口
                'chooseImage',              //拍照或从手机相册中选图接口
                'previewImage',             //预览图片接口
                'uploadImage',              //上传图片接口
                'downloadImage',            //下载图片接口
                'translateVoice',           //识别音频并返回识别结果接口
                'getNetworkType',           //获取网络状态接口
                'openLocation',             //使用微信内置地图查看位置接口
                'getLocation',              //获取地理位置接口
                'hideMenuItems',            //批量隐藏功能按钮接口
                'showMenuItems',            //批量显示功能按钮接口
                'hideAllNonBaseMenuItem',   //隐藏所有非基础按钮接口
                'showAllNonBaseMenuItem',   //显示所有功能按钮接口
                'closeWindow',              //关闭当前网页窗口接口
                'scanQRCode',               //调起微信扫一扫接口
                'chooseWXPay',              //发起一个微信支付请求
                'openProductSpecificView',  //跳转微信商品页接口
                'addCard',                  //批量添加卡券接口
                'chooseCard',               //拉取适用卡券列表并获取用户选择信息
                'openCard',                 //查看微信卡包中的卡券接口
                'hideOptionMenu',           //
                'showOptionMenu'            //
            ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
        wx.ready(function(){
            // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
            wx.checkJsApi({
                jsApiList: ['onVoiceRecordEnd'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
                success: function(res) {
                    console.log(res);
                }
            });


                wx.onMenuShareTimeline({//修改了微信自带的分享接口
                    title: '分享标题', 
                    link: 'http://joneco.tunnel.echomod.cn/aaa', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                    imgUrl: 'http://www.runoob.com/wp-content/uploads/2016/02/react.png', // 分享图标
                    success: function () { 
                        window.alert('分享成功');
                    },
                    cancel: function () { 
                        window.alert('取消了分享');
                    },
                    fail:function(res){
                        window.alert('分享失败'); 
                    }
                });

                wx.onMenuShareAppMessage({//修改了微信自带的分享接口
                    title: '测试发送', // 分享标题
                    desc: '没有描述', // 分享描述
                    link: 'http://joneco.tunnel.echomod.cn/aaa', // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                    imgUrl: 'http://www.runoob.com/wp-content/uploads/2016/02/react.png', // 分享图标
                    type: 'link', // 分享类型,music、video或link，不填默认为link
                    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                    success: function () { 
                        window.alert('分享成功');
                    },
                    cancel: function () { 
                        window.alert('取消了分享');
                    },
                    fail:function(res){
                        window.alert('分享失败'); 
                    }
                });

            $('#chooseImage').on('click',function(){
                wx.chooseImage({
                    count: 1, // 默认9
                    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                    success: function (res) {
                        var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
                    }
                });
            })



            var isRecording = false;
            $('#start').on('click',function(){
                if(!isRecording){
                    isRecording = true;
                    wx.startRecord({
                        cancel:function(){
                            window.alert('那就不能语音搜索了！');
                        }
                    });
                }
            })
            $('#end').on('click',function(){
                isRecording = false;
                wx.stopRecord({
                    success:function(res){
                        var localId = res.localId;
                        wx.translateVoice({
                            localId:'localId',
                            isShowProgressTips:1,
                            //默认为1，显示进度条
                            success:function(res){
                                window.alert(res.translateResult); 
                            },
                            fail:function(res){
                                window.alert('识别失败'); 
                            }
                        })
                    }
                })
            })
        });
        wx.error(function(res){
            // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        });
        </script>
    </body>
    </html>

    */
});

var createNonceStr = function() {
    return Math.random().toString(36).substr(2, 15);
};

var createTimestamp = function() {
    return parseInt(new Date().getTime() / 1000) + '';
};

var _sign = function(noncestr, ticket, timestamp, url) {
    var params = [
        'noncestr=' + noncestr,
        'jsapi_ticket=' + ticket,
        'timestamp=' + timestamp,
        'url=' + url
    ];
    var str = params.sort().join('&');
    var shac = crypto.createHash('sha1');

    shac.update(str);
    return shac.digest('hex');
}

function sign(ticket, url) {
    var noncestr = createNonceStr();
    var timestamp = createTimestamp();
    var signature = _sign(noncestr, ticket, timestamp, url);

    return {
        noncestr: noncestr,
        timestamp: timestamp,
        signature: signature
    }
}


var app = new koa();

app.use(function*(next) {
    if (this.url.indexOf('/aaa') > -1) {
        var wechat_w = new wechat(config);
        var data = yield wechat_w.fetchAccessToken();

        var ticketData = yield wechat_w.fetchTicket(data.access_token);
        var url = this.href;

        var params = sign(ticketData.ticket, url);

        this.body = ejs.render(tpl, params);
        return next;
    }
    yield next;
});

app.use(wechat_g(config, weixin.reply));


app.listen(8088);
console.log('server running on 8088 port');