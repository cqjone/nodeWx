'use strict'

var sha1 = require('sha1'); //加密模块

var getRawBody = require('raw-body');

var Wechat = require('./wechat');

var util = require('./util');

module.exports = function(opts, handler) {

    var wechat = new Wechat(opts); //管理access_token和其他接口

    return function*(next) {

        var that = this;
        // console.log(this);
        // console.log("本次请求的主机地址：" + this.header.host);
        // console.log("本次请求的url地址：" + this.href);

        var token = opts.wx.token; //传入的配置对象

        //获取POST参数
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;

        var echostr = this.query.echostr;

        //字典排序，组合字符串
        var str = [token, timestamp, nonce].sort().join('');

        //sha1加密
        var sha_str = sha1(str);

        //判断是否为微信服务请求
        if (sha_str === signature) {

            if (this.request.method === 'GET') {
                // console.log(this);
                this.body = echostr + '';
                console.log('GET：echostr====' + echostr);
            } else if (this.request.method === 'POST') {
                // console.log(this);

                //保存微信服务器返回的数据
                var data = yield getRawBody(this.req, {
                    length: this.req.length,
                    limit: '1mb',
                    encoding: this.charset
                });

                //打印xml数据
                // console.log(data.toString());

                //解析xml数据
                var　 content = yield util.parseXMLAsync(data);
                // console.log(content);

                //格式化xml　
                var　 message = util.formatMessage(content.xml);
                // console.log(message);

                this.weixin = message;

                yield handler.call(this, next);

                wechat.reply.call(this);
            }
        } else {
            this.body = "wrong";
            // console.log('sha_str != signature : 请求不是来自微信服务器');
            return false;
        }
        //  else if (this.header.host === '') {

        // } 
    }
}