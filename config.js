'use strict'

var path = require('path');

var util = require('./libs/util');

var wechat_file = path.join(__dirname, './config/wechat.txt');

//token用于接入微信，而appID和appSecret主要用于获取access_token
var config = {
    wx: {
        //测试公众号
        // appID: 'wx60ed01dc892a54fc',
        // appSecret: 'ab692fb1a88d800799c9ad06acffd206',
        // token: 'joneco',

        //joneco公众号
        appID: 'wxbb953f922a054604',
        appSecret: '7211628265201acc224c36a8dade0710',
        token: 'joneco',

        //获取access_token
        getAccessToken: function() {
            return util.readFileAsync(wechat_file);
        },
        //保存access_token
        saveAccessToken: function(data) {
            data = JSON.stringify(data); //json转字符串
            return util.writeFileAsync(wechat_file, data);
        }
    }
}

module.exports = config;