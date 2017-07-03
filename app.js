'use strict'

var koa = require('koa'); //koa服务

var wechat_g = require('./wechat/generator');

var wechat = require('./wechat/wechat');

var path = require('path');

var ejs = require('ejs');

var heredoc = require('heredoc');

var crypto = require('crypto');

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
        
        
    	<title>电影</title>
    </head>
    <body>
        <h1>点击标题开始微信开发</h1>
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
                'startRecord',
                'stopRecord',
                'onVoiceRecordEnd',
                'translateVoice'
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