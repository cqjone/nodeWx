'use strict'

var koa = require('koa');//koa服务

var wechat_g = require('./wechat/generator');

var path = require('path');

var util = require('./libs/util');

var config = require('./config');//配置文件

var weixin = require('./weixin');

var wechat_file = path.join(__dirname,'./config/wechat.txt');

var app = new koa();

app.use(wechat_g(config,weixin.reply));


app.listen(8088);
console.log('server running on 8088 port');