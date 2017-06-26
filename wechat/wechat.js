'use strict'

var Promise = require('bluebird'); //Promise模块
var _lodash = require('lodash');
var request = Promise.promisify(require('request'));
var util = require('./util');
var fs = require('fs');

var url_prefix = "https://api.weixin.qq.com/cgi-bin/"; //微信所有请求的url前缀

var api = {
    accessToken: url_prefix + "token?grant_type=client_credential", //获取access_token地址
    temporary: { //临时上传素材地址
        //临时 https://api.weixin.qq.com/cgi-bin/media/upload?access_token=ACCESS_TOKEN&type=TYPE
        upload: url_prefix + "media/upload?"
    },
    permanent: { //上传永久素材地址
        //其他 https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=ACCESS_TOKEN&type=TYPE
        upload: url_prefix + "material/add_material?",

        //图文 https://api.weixin.qq.com/cgi-bin/material/add_news?access_token=ACCESS_TOKEN
        uploadNews: url_prefix + 'material/add_news?',

        //上传图文消息内的图片获取URL https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=ACCESS_TOKEN
        uploadNewsPic: url_prefix + 'media/uploadimg?'


    }

}

function Wechat(opts) {
    var that = this;
    this.appID = opts.wx.appID;
    this.appSecret = opts.wx.appSecret;

    //获取access_token
    this.getAccessToken = opts.wx.getAccessToken;
    //保存access_token
    this.saveAccessToken = opts.wx.saveAccessToken;

    //微信返回的access_token
    // {"access_token":"ACCESS_TOKEN","expires_in":7200}

    //获取access_token并判断
    this.fetchAccessToken();

}


//判断access_token是否过期
Wechat.prototype.isValidAccessToken = function(data) {
    //判断access_token是否有效
    if (!data || !data.access_token || !data.expires_in) { return false; }

    //当前时间
    var access_token = data.access_token;
    var expires_in = data.expires_in;
    var now = (new Date().getTime());

    if (now < expires_in) {
        return data;
    } else {
        return false;
    }
}

//更新access_token
Wechat.prototype.updateAccessToken = function() {
    var appID = this.appID;
    var appSecret = this.appSecret;

    //https请求方式: GET
    //https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET

    var url = 　api.accessToken + '&appid=' + appID + '&secret=' + appSecret;

    return new Promise(function(resolve, reject) {
        request({ url: url, json: true }).then(function(response) {
            var data = response['body'];

            var now = (new Date().getTime());
            var expires_in = now + (data.expires_in - 20) * 1000;

            data.expires_in = expires_in;

            resolve(data);
        })
    })
}

//获取access_token并判断
Wechat.prototype.fetchAccessToken = function(data) {
    var that = this;
    if (this.access_token && this.expires_in) {
        if (this.isValidAccessToken(this)) {
            return Promise.resolve(this);
        }
    }

    this.getAccessToken()
        .then(function(data) {
            try {
                //json格式化
                data = JSON.parse(data);
            } catch (e) {
                return that.updateAccessToken(); //更新access_token
            }

            //判断access_token是否过期
            if (that.isValidAccessToken(data)) {
                return Promise.resolve(data);
                // return new Promise(function(resolve, reject){
                //     resolve(data);
                // })
            } else {
                return that.updateAccessToken(); //更新access_token
            }
        })
        .then(function(data) { //合法结果
            that.access_token = data.access_token;
            that.expires_in = data.expires_in;

            that.saveAccessToken(data); //保存

            return Promise.resolve(data);
        });
}

//上传临时&永久素材（图片，视频，音乐）
Wechat.prototype.uploadMaterial = function(type, material, permanent) {
    var that = this;

    var form = {};
    //默认为临时素材上传
    var uploadUrl = api.temporary.upload;

    //判断是否为永久素材上传
    if (permanent) {
        uploadUrl = api.permanent.upload; //默认为其他类型
        _lodash.extend(form, permanent);
    }

    //判断是否为永久素材上传
    if (type === 'pic') {
        uploadUrl = api.permanent.uploadNewsPic;
    }

    if (type === 'news') {
        uploadUrl = api.permanent.uploadNews;
        form = material;
    } else {
        form.media = fs.createReadStream(material);
    }



    var appID = this.appID;
    var appSecret = this.appSecret;

    // http请求方式： POST / FORM， 使用https上传临时素材
    // https: //api.weixin.qq.com/cgi-bin/media/upload?access_token=ACCESS_TOKEN&type=TYPE

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = uploadUrl + 'access_token=' + data.access_token;
                //判断是否为永久上传
                if (!permanent) {
                    url += '&type=' + type;
                } else {
                    form.access_token = data.access_token;
                }

                var options = {
                    method: 'POST',
                    url: url,
                    json: true
                }

                if (type === 'news') {
                    options.body = form;
                } else {
                    options.formData = form;
                }



                request({ method: 'POST', url: url, formData: form, json: true })
                    .then(function(response) {
                        // console.log(response)
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('上传临时素材失败')
                        }

                        resolve(data);
                    })
                    .catch(function(err) {
                        reject(err);
                    })
            })

    })
}

//回复消息
Wechat.prototype.reply = function() {
    var content = this.body;
    var message = this.weixin;

    var xml = util.tpl(content, message);
    // console.log(xml);
    // console.log(content);
    this.status = 200;
    this.type = 'application/xml';
    this.body = xml;
}

module.exports = Wechat;