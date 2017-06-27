'use strict'

var Promise = require('bluebird'); //Promise模块
var _lodash = require('lodash');
var request = Promise.promisify(require('request'));
var util = require('./util');
var fs = require('fs');

var url_prefix = "https://api.weixin.qq.com/cgi-bin/"; //微信所有请求的url前缀

var api = {
    accessToken: url_prefix + "token?grant_type=client_credential", //获取access_token地址
    temporary: { //临时素材地址
        //上传临时 https://api.weixin.qq.com/cgi-bin/media/upload?access_token=ACCESS_TOKEN&type=TYPE
        upload: url_prefix + "media/upload?",

        // 公众号可以使用本接口获取临时素材（即下载临时的多媒体文件）。请注意，视频文件不支持https下载，调用该接口需http协议。
        // http请求方式: GET,https调用
        //https://api.weixin.qq.com/cgi-bin/media/get?access_token=ACCESS_TOKEN&media_id=MEDIA_ID
        get: url_prefix + 'media/get?'

    },
    permanent: { //永久素材地址
        //上传其他 https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=ACCESS_TOKEN&type=TYPE
        upload: url_prefix + "material/add_material?",

        //上传图文 https://api.weixin.qq.com/cgi-bin/material/add_news?access_token=ACCESS_TOKEN
        uploadNews: url_prefix + 'material/add_news?',

        //上传上传图文消息内的图片获取URL https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=ACCESS_TOKEN
        uploadNewsPic: url_prefix + 'media/uploadimg?',

        // http请求方式: POST,https协议
        // https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=ACCESS_TOKEN
        get: url_prefix + 'material/get_material?'


    }

}

//微信接口程序（消息管理、素材管理）
//opts:微信配置的appID和appID及它们的获取保存方法
function Wechat(opts) {
    var that = this;
    this.appID = opts.wx.appID;
    this.appSecret = opts.wx.appID;

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
//type:上传文件类型
//material:文件地址
//permanent:上传永久类型的素材才会有此字段
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

    //判断永久素材类型
    if (type === 'pic') {
        uploadUrl = api.permanent.uploadNewsPic;
    } else if (type === 'news') {
        uploadUrl = api.permanent.uploadNews;
        form = material;
    } else {
        form.media = fs.createReadStream(material);
    }

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
                request(options)
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

//获取临时&永久素材
//mediaId:媒体文件ID
//type:文件类型
//permanent:获取永久类型的素材才会有此字段
Wechat.prototype.getMaterial = function(mediaId, type, permanent) {
    var that = this;
    var form = {};
    //默认为临时素材获取
    var getUrl = api.temporary.get;
    //判断是否为永久素材
    if (permanent) {
        getUrl = api.permanent.get;
        // _lodash.extend(form, permanent);
    }

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = getUrl + 'access_token=' + data.access_token;

                var options = { method: 'POST', url: url, json: true }

                if (permanent) {
                    form.media_id = mediaId;
                    form.access_token = data.access_token;
                    options.body = form;
                } else {
                    url += '&media_id=' + mediaId;
                    if (type === 'video') {
                        url = url.replace('https://', 'http://')
                    }
                }
                if (type === 'video' || type === 'news') {
                    request(options).then(function(response) {
                            var redata = response['body'];
                            if (redata) {
                                resolve(redata);
                            } else {
                                throw new Error('上传临时素材失败')
                            }

                        })
                        .catch(function(err) {
                            reject(err);
                        });
                } else {
                    resolve(url);
                }
            })

    })

}

// 删除永久素材
Wechat.prototype.delMaterialdetail = function(mediaId) {
    var that = this;
    var form = { media_id: mediaId };

    // http请求方式: POST
    // https://api.weixin.qq.com/cgi-bin/material/del_material?access_token=ACCESS_TOKEN

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = 　url_prefix + 'material/del_material?access_token=' + data.access_token + '&media_id=' + mediaId;

                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('删除永久素材失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);
                    })

            })
    })
}

// 修改永久图文素材
Wechat.prototype.updateMaterialdetail = function(mediaId, news) {
    var that = this;
    var form = { media_id: mediaId };
    _.extend(form, news);

    // http请求方式: POST
    // https://api.weixin.qq.com/cgi-bin/material/update_news?access_token=ACCESS_TOKEN

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = 　url_prefix + 'material/update_news?access_token=' + data.access_token + '&media_id=' + mediaId;

                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('修改永久素材失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);
                    })

            })
    })
}




//获取各种永久素材的数量
Wechat.prototype.getMaterialNum = function() {
    var that = this;

    // http请求方式: GET
    // https://api.weixin.qq.com/cgi-bin/material/get_materialcount?access_token=ACCESS_TOKEN

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = 　url_prefix + 'material/get_materialcount?access_token=' + data.access_token;

                request({ url: url, json: true })
                    .then(function(response) {

                        // console.log(response)
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('获取数据条目失败')
                        }

                        resolve(data);
                    })
                    .catch(function(err) {
                        reject(err);
                    })

            })
    })
}

//获取永久素材的详细信息
Wechat.prototype.getMaterialdetail = function(options) {
    var that = this;
    var form = {};

    form.type = options.type || 'image';
    form.offset = options.offset || 0;
    form.count = options.count || 10;

    // http请求方式: POST
    // https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=ACCESS_TOKEN

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = 　url_prefix + 'material/batchget_material?access_token=' + data.access_token;

                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('获取永久素材的详细信息失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);
                    })

            })
    })
}




//回复消息（返回拼接好的消息返回给微信服务器）
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