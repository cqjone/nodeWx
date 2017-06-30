'use strict'
/**
 * 微信接口api
 * url_prefix:接口请求的url公共的部分
 * api：接口请求的url（已拼接url_prefix，携带参数需自己拼接）
 * Wechat：接口构造函数，每个接口都附加在它的prototype上
 * 获取access_token并判断              Wechat.prototype.fetchAccessToken
 * 判断access_token是否过期            Wechat.prototype.isValidAccessToken
 * 更新access_token                   Wechat.prototype.updateAccessToken
 * 上传临时&永久素材（图片，视频，音乐） Wechat.prototype.uploadMaterial
 * 获取临时&永久素材                   Wechat.prototype.getMaterial
 * 删除永久素材                        Wechat.prototype.delMaterialdetail
 * 修改永久图文素材                    Wechat.prototype.updateMaterialdetail
 * 获取各种永久素材的数量              Wechat.prototype.getMaterialNum
 * 获取永久素材的详细信息              Wechat.prototype.getMaterialdetail
 * 创建标签POST/json                  Wechat.prototype.creatTag
 * 获取标签GET                        Wechat.prototype.getTags
 * 编辑标签POST/json                  Wechat.prototype.updateTag
 * 删除标签POST/json                  Wechat.prototype.deleteTag
 * 获取标签下粉丝列表GET               Wechat.prototype.userTagGet
 * 批量为用户打标签POST/json           Wechat.prototype.tagBatchtagging
 * 批量为用户取消标签POST/json         Wechat.prototype.tagBatchuntagging
 * 获取用户身上的标签列表POST/json     Wechat.prototype.getidlist 
 * 设置用户备注名POST/json（暂时开放给微信认证的服务号）    Wechat.prototype.setUserName
 * 获取用户基本信息（包括UnionID机制）GET                  Wechat.prototype.getUserInfo
 * 批量获取用户基本信息POST/json                          Wechat.prototype.getUsersInfo
 * 获取用户列表POST/json                                 Wechat.prototype.getUsersList
 * 获取公众号的黑名单列表POST/json                        Wechat.prototype.getblacklist
 * 拉黑用户POST/json                                     Wechat.prototype.batchblacklist
 * 取消拉黑用户POST/json                                 Wechat.prototype.batchunblacklist
 * 根据标签进行群发【订阅号与服务号认证后均可用】POST       Wechat.prototype.tagMass
 * 根据OpenID列表群发【订阅号不可用，服务号认证后可用】POST Wechat.prototype.openIdMass
 * 删除群发【订阅号与服务号认证后均可用】POST              Wechat.prototype.deleteMass
 * 自定义菜单创建接口                                    Wechat.prototype.createMenu 
 * 自定义菜单查询接口                                    Wechat.prototype.getMenu
 * 自定义菜单删除接口                                    Wechat.prototype.delMenu
 * 创建个性化菜单                                        Wechat.prototype.createPersonalMenu
 * 删除个性化菜单                                        Wechat.prototype.delPersonalMenu
 * 获取自定义菜单配置接口                                 Wechat.prototype.getconfig
 * 
 * 创建+获取二维码 ticket
 * 通过ticket换取二维码TICKET记得进行UrlEncode           Wechat.prototype.createQrcode
 * 
 * 二维码长链接转短链接接口                              Wechat.prototype.QrcodeShort
 */
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
    },
    group: { //标签管理
        //创建标签POST/json
        creatTag: url_prefix + 'tags/create?access_token=',
        //获取标签GET
        getTags: url_prefix + 'tags/get?access_token=',
        //编辑标签POST/json
        updateTag: url_prefix + 'tags/update?access_token=',
        //删除标签POST/json
        deleteTag: url_prefix + 'tags/delete?access_token=',
        //获取标签下粉丝列表GET
        userTagGet: url_prefix + 'user/tag/get?access_token=',

        //批量为用户打标签POST/json
        tagBatchtagging: url_prefix + 'tags/members/batchtagging?access_token=',
        //批量为用户取消标签POST/json
        tagBatchuntagging: url_prefix + 'tags/members/batchuntagging?access_token=',
        //获取用户身上的标签列表POST/json
        getidlist: url_prefix + 'tags/getidlist?access_token='
    },
    users: { //用户管理
        //设置用户备注名POST/json（暂时开放给微信认证的服务号）
        setUserName: url_prefix + 'user/info/updateremark?access_token=',
        //获取用户基本信息（包括UnionID机制）GET
        getUserInfo: url_prefix + 'user/info?access_token=',
        //批量获取用户基本信息POST/json
        getUsersInfo: url_prefix + 'user/info/batchget?access_token=',
        //获取用户列表POST/json
        getUsersList: url_prefix + 'user/get?access_token=',

        //获取公众号的黑名单列表POST/json
        getblacklist: url_prefix + 'members/getblacklist?access_token=',
        //拉黑用户POST/json
        batchblacklist: url_prefix + 'tags/members/batchblacklist?access_token=',
        //取消拉黑用户POST/json
        batchunblacklist: url_prefix + 'tags/members/batchunblacklist?access_token='
    },
    mass: {
        //根据标签进行群发【订阅号与服务号认证后均可用】POST
        tagMass: url_prefix + 'message/mass/sendall?access_token=',

        //根据OpenID列表群发【订阅号不可用，服务号认证后可用】POST
        openIdMass: url_prefix + 'message/mass/send?access_token=',

        //删除群发【订阅号与服务号认证后均可用】POST
        deleteMass: url_prefix + 'message/mass/delete?access_token=',

        //预览接口【订阅号与服务号认证后均可用】POST
        previewMass: url_prefix + 'message/mass/preview?access_token=',

        //查询群发消息发送状态【订阅号与服务号认证后均可用】POST
        statusMass: url_prefix + 'message/mass/get?access_token=',
    },
    menu: {
        //自定义菜单创建接口
        create: url_prefix + 'menu/create?access_token=',
        //自定义菜单查询接口
        get: url_prefix + 'menu/get?access_token=',
        //自定义菜单删除接口
        del: url_prefix + 'menu/delete?access_token=',
        //个性化菜单接口
        personal: {
            //创建个性化菜单
            create: url_prefix + 'menu/addconditional?access_token=',
            //删除个性化菜单
            del: url_prefix + 'menu/delconditional?access_token=',
        },
        //获取自定义菜单配置接口
        getconfig: url_prefix + 'get_current_selfmenu_info?access_token='
    },
    qrcode: { //二维码
        //创建二维码ticket
        create: url_prefix + 'qrcode/create?access_token=',
        //通过ticket换取二维码TICKET记得进行UrlEncode 
        show: 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=',
        // 长链接转短链接接口
        short: url_prefix + 'shorturl?access_token='
    }


}



//微信接口程序（消息管理、素材管理）
//opts:微信配置的appID和appID及它们的获取保存方法
function Wechat(opts) {
    var that = this;
    this.appID = opts.wx.appID;
    this.appSecret = opts.wx.appSecret;
    this.errCode = opts.errcode;

    //获取access_token
    this.getAccessToken = opts.wx.getAccessToken;
    //保存access_token
    this.saveAccessToken = opts.wx.saveAccessToken;
    //报错提示
    // this.errMsg = opts.wx.errMsg;

    //微信返回的access_token
    // {"access_token":"ACCESS_TOKEN","expires_in":7200}

    //获取access_token并判断
    this.fetchAccessToken();

}

//错误编码
Wechat.prototype.errMsg = function(err) {
    if (err.errcode) {
        console.log('******************编码***********************');
        console.log('**提示**：' + this.errCode[err.errcode]);
        console.log('*********************************************');
        // return;
    }
}

//获取access_token并判断
Wechat.prototype.fetchAccessToken = function() {
    var that = this;
    if (that.access_token && this.expires_in) {
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
                        that.errMsg(response['body']);
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
                            that.errMsg(response['body']);
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
                        that.errMsg(response['body']);
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
                        that.errMsg(response['body']);
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
                        that.errMsg(response['body']);
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
                        that.errMsg(response['body']);
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

// //创建标签POST/json
// creatTag: url_prefix + 'tags/create?access_token=',
Wechat.prototype.creatTag = function(name) {
    var that = this;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.group.creatTag + data.access_token;

                var form = {
                    "tag": {
                        "name": name
                    }
                }
                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('创建标签失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);

                    })

            })
    })
}

// //获取标签GET
// getTags: url_prefix + 'tags/get?access_token=',
Wechat.prototype.getTags = function() {
    var that = this;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.group.getTags + data.access_token;
                request({ url: url, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('获取标签失败')
                        }
                        resolve(data);
                    })
                    .catch(function(err) {
                        reject(err);

                    })

            })
    })
}

// //编辑标签POST/json
// updateTag: url_prefix + 'tags/update?access_token=',
Wechat.prototype.updateTag = function(tagID, name) {
    var that = this;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.group.updateTag + data.access_token;

                var form = {
                    "tag": {
                        "id": tagID,
                        "name": name
                    }
                }
                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('编辑标签失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);

                    })

            })
    })
}

// //删除标签POST/json
// deleteTag: url_prefix + 'tags/delete?access_token=',
Wechat.prototype.deleteTag = function(tagID) {
    var that = this;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.group.deleteTag + data.access_token;

                var form = {
                    "tag": {
                        "id": tagID
                    }
                }
                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('删除标签失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);

                    })

            })
    })
}

// //获取标签下粉丝列表GET
// userTagGet: url_prefix + 'user/tag/get?access_token=',
Wechat.prototype.userTagGet = function(tagID) {
    var that = this;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.group.userTagGet + data.access_token;

                var form = {
                    "tagid": tagID,
                    "next_openid": ""
                }
                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('获取标签下粉丝列表失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);

                    })

            })
    })
}


// //批量为用户打标签POST/json
// tagBatchtagging: url_prefix + 'tags/members/batchtagging?access_token=',
Wechat.prototype.tagBatchtagging = function(openIds, tagID) {
    var that = this;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.group.tagBatchtagging + data.access_token;

                var form = {
                    "openid_list": openIds,
                    "tagid": tagID
                }
                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('批量为用户打标签失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);

                    })

            })
    })
}

// //批量为用户取消标签POST/json
// tagBatchuntagging: url_prefix + 'tags/members/batchuntagging?access_token=',
Wechat.prototype.tagBatchuntagging = function(openIds, tagID) {
    var that = this;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.group.tagBatchuntagging + data.access_token;

                var form = {
                    "openid_list": openIds,
                    "tagid": tagID
                }
                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('批量为用户取消标签失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);

                    })

            })
    })
}

// //获取用户身上的标签列表POST/json
// getidlist: url_prefix + 'tags/getidlist?access_token='
Wechat.prototype.getidlist = function(openIdD) {
    var that = this;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.group.getidlist + data.access_token;

                var form = {
                    "openid": openIdD
                }
                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('获取用户身上的标签列表失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);

                    })

            })
    })
}


// setUserName: url_prefix + 'user/info/updateremark?access_token=',
// //设置用户备注名POST/json（暂时开放给微信认证的服务号）
Wechat.prototype.setUserName = function(openId, name) {
    var that = this;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.users.setUserName + data.access_token;

                var form = {
                    "openid": openIdD,
                    "remark": name
                }
                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('设置用户备注名失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);

                    })

            })
    })
}

// getUserInfo: url_prefix + 'user/info?access_token=',
// //获取用户基本信息（包括UnionID机制）GET
Wechat.prototype.getUserInfo = function(openId) {
    var that = this;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.users.getUserInfo + data.access_token + '&openid=' + openId + '&lang=zh_CN';
                request({ url: url, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('获取用户基本信息失败')
                        }
                        resolve(data);
                    })
                    .catch(function(err) {
                        reject(err);

                    })

            })
    })
}

// getUsersInfo: url_prefix + 'user/info/batchget?access_token=',
// //批量获取用户基本信息POST/json
Wechat.prototype.getUsersInfo = function(userList) {
    var that = this;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.users.getUsersInfo + data.access_token;

                var form = {
                    "user_list": userList
                }
                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('批量获取用户基本信息失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);

                    })

            })
    })
}

// getUsersList: url_prefix + 'user/get?access_token=',
// //获取用户列表POST/json
Wechat.prototype.getUsersList = function(nextOpenId) {
    var that = this;
    var openid = nextOpenId ? nextOpenId : '';
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.users.getUsersList + data.access_token + '&next_openid=' + openid;
                request({ url: url, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('获取用户列表失败')
                        }
                        resolve(data);
                    })
                    .catch(function(err) {
                        reject(err);

                    })

            })
    })
}

// //获取公众号的黑名单列表POST/json
// getblacklist: url_prefix + 'members/getblacklist?access_token=',
Wechat.prototype.getblacklist = function(beginOpenid) {
    var that = this;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.users.tagBatchtagging + data.access_token;

                var form = {
                    "begin_openid": beginOpenid
                }
                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('获取公众号的黑名单列表失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);

                    })

            })
    })
}

// //拉黑用户POST/json
// batchblacklist: url_prefix + 'tags/members/batchblacklist?access_token=',
Wechat.prototype.getblacklist = function(openedList) {
    var that = this;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.users.tagBatchuntagging + data.access_token;

                var form = {
                    "opened_list": openedList
                };
                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('拉黑用户失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);

                    })

            })
    })
}

// //取消拉黑用户POST/json
// batchunblacklist: url_prefix + 'tags/members/batchunblacklist?access_token='
Wechat.prototype.batchunblacklist = function(openedList) {
    var that = this;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.users.getidlist + data.access_token;

                var form = {
                    "opened_list": openedList
                };
                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('取消拉黑用户失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);

                    })
            })
    })
}

// tagMass: url_prefix + 'message/mass/sendall?access_token=',
// //根据标签进行群发【订阅号与服务号认证后均可用】POST
Wechat.prototype.tagMass = function(tagId, msgType, content) {
    if (tagId == '') { console.log('请填写标签ID'); }
    if (msgType == '') { console.log('请填写消息类型'); }
    if (content == '') { console.log('请填写消息内容'); }

    var that = this;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var form = {
                    "filter": {
                        "is_to_all": false,
                        "tag_id": tagId
                    },
                    "msgtype": msgType,
                    "send_ignore_reprint": 0
                };

                if (msgType === 'mpnews') { //图文消息
                    form['mpnews'] = { "media_id": content };
                } else if (msgType === 'text') { //文本
                    form['text'] = { "content": content };
                } else if (msgType === 'voice') { //语音/音频
                    form['voice'] = { "media_id": content }
                } else if (msgType === 'image') { //图片
                    form['image'] = { "media_id": content }
                } else if (msgType === 'mpvideo') { //视频
                    var mediaId = '';

                    var url1 = 'https://api.weixin.qq.com/cgi-bin/media/uploadvideo?access_token=' + data.access_token;
                    request({
                            method: 'POST',
                            url: url1,
                            body: {
                                "media_id": content,
                                "title": "Re:CREATORS OP gravityWall forever",
                                "description": "作词：泽野弘之、Tielle\n作曲、编曲：泽野弘之\n歌：SawanoHiroyuki[nZk]:Tielle & Gemie"
                            },
                            json: true
                        })
                        .then(function(response) {
                            that.errMsg(response['body']);
                            var redata = response['body'];
                            console.log('新的视频ID');
                            console.log(redata);
                            if (redata) {
                                mediaId = redata.media_id;
                            } else {
                                throw new Error('获取视频ID失败')
                            }
                        })
                        .catch(function(err) {
                            reject(err);

                        })

                    form['mpvideo'] = { "media_id": mediaId }
                } else if (msgType === 'wxcard') { //卡券
                    form['wxcard'] = { "media_id": content }
                }
                var url = api.mass.tagMass + data.access_token;
                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('群发失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);

                    })
            })
    })
}

// openIdMass: url_prefix + 'message/mass/send?access_token=',
// //根据OpenID列表群发【订阅号不可用，服务号认证后可用】POST
Wechat.prototype.openIdMass = function(openedList, msgType, content) {
    if (openedList == '' && openedList.length == 0) { console.log('请填写用户ID'); }
    if (msgType == '') { console.log('请填写消息类型'); }
    if (content == '') { console.log('请填写消息内容'); }

    var that = this;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var form = {
                    "touser": openedList,
                    "msgtype": msgType,
                    "send_ignore_reprint": 0
                };

                if (msgType === 'mpnews') { //图文消息
                    form['mpnews'] = { "media_id": content };
                } else if (msgType === 'text') { //文本
                    form['text'] = { "content": content };
                } else if (msgType === 'voice') { //语音/音频
                    form['voice'] = { "media_id": content }
                } else if (msgType === 'image') { //图片
                    form['image'] = { "media_id": content }
                } else if (msgType === 'mpvideo') { //视频
                    var mediaId = '';

                    var url1 = 'https://api.weixin.qq.com/cgi-bin/media/uploadvideo?access_token=' + data.access_token;
                    request({
                            method: 'POST',
                            url: url1,
                            body: {
                                "media_id": content,
                                "title": "Re:CREATORS OP gravityWall forever",
                                "description": "作词：泽野弘之、Tielle\n作曲、编曲：泽野弘之\n歌：SawanoHiroyuki[nZk]:Tielle & Gemie"
                            },
                            json: true
                        })
                        .then(function(response) {
                            that.errMsg(response['body']);
                            var redata = response['body'];
                            console.log('新的视频ID');
                            console.log(redata);
                            if (redata) {
                                mediaId = redata.media_id;
                            } else {
                                throw new Error('获取视频ID失败')
                            }
                        })
                        .catch(function(err) {
                            reject(err);

                        })

                    form['mpvideo'] = { "media_id": mediaId }
                } else if (msgType === 'wxcard') { //卡券
                    form['wxcard'] = { "media_id": content }
                }
                var url = api.mass.openIdMass + data.access_token;
                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('群发失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);

                    })
            })
    })
}

// deleteMass: url_prefix + 'message/mass/delete?access_token=',
// //删除群发【订阅号与服务号认证后均可用】POST
Wechat.prototype.deleteMass = function(msgId, articleIdx) {
    if (msgId == '') { console.log('请填写删除消息的ID'); }

    var that = this;

    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var form = {
                    "msg_id": msgId,
                    "article_idx": articleIdx ? articleIdx : 1
                };

                var url = api.mass.deleteMass + data.access_token;
                request({ method: 'POST', url: url, body: form, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('群发失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);

                    })
            })
    })
}

//这两个接口先放放
// previewMass: url_prefix + 'message/mass/preview?access_token=',
// //预览接口【订阅号与服务号认证后均可用】POST

// statusMass: url_prefix + 'message/mass/get?access_token=',
// //查询群发消息发送状态【订阅号与服务号认证后均可用】POST


// create: url_prefix + 'menu/create?access_token=',
// //自定义菜单创建接口
Wechat.prototype.createMenu = function(menu) {
    var that = this;
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.menu.create + data.access_token;
                request({ method: 'POST', url: url, body: menu, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('创建自定义菜单失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);

                    })
            })
    })
}

// get: url_prefix + 'menu/get?access_token=',
// //自定义菜单查询接口
Wechat.prototype.getMenu = function() {
    var that = this;
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.menu.get + data.access_token;
                request({ url: url, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('获取自定义菜单失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);
                    })
            })
    })
}


// del: url_prefix + 'menu/delete?access_token=',
// //自定义菜单删除接口
Wechat.prototype.delMenu = function() {
    var that = this;
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.menu.del + data.access_token;
                request({ url: url, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('删除自定义菜单失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);
                    })
            })
    })
}

// //个性化菜单接口

//create: 'menu/addconditional?access_token=',
////创建个性化菜单
Wechat.prototype.createPersonalMenu = function(menu) {
    var that = this;
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.menu.personal.create + data.access_token;
                request({ method: 'POST', url: url, body: menu, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('创建个性化菜单失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);

                    })
            })
    })
}

//del: 'menu/delconditional?access_token=',
////删除个性化菜单
Wechat.prototype.delPersonalMenu = function(menuId) {
    var that = this;
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.menu.personal.del + data.access_token;
                request({ method: 'POST', url: url, body: { "menuid": menuId }, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('删除个性化菜单失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);
                    })
            })
    })
}

// getconfig: 'get_current_selfmenu_info?access_token='
// //获取自定义菜单配置接口
Wechat.prototype.getconfig = function(useId) {
    var that = this;
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.menu.getconfig + data.access_token;
                request({ method: 'POST', url: url, body: { "menuid": useId }, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('删除个性化菜单失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);
                    })
            })
    })
}

// create: url_prefix + 'qrcode/create?access_token=',
// show: url_prefix + 'showqrcode?ticket='
//创建+获取二维码 ticket 通过ticket换取二维码TICKET记得进行UrlEncode 
Wechat.prototype.createQrcode = function(qr) {
    var that = this;
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.qrcode.create + data.access_token;
                request({ method: 'POST', url: url, body: qr, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = api.qrcode.show + encodeURI(response['body'].ticket);
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('二维码获取失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);
                    })
            })
    })
}

// short: url_prefix + 'shorturl?access_token='
// 长链接转短链接接口
Wechat.prototype.QrcodeShort = function(short) {
    var that = this;
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = api.qrcode.short + data.access_token;
                request({ method: 'POST', url: url, body: short, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('转换失败')
                        }
                    })
                    .catch(function(err) {
                        reject(err);
                    })
            })
    })
}

//https://api.weixin.qq.com/semantic/semproxy/search?access_token=YOUR_ACCESS_TOKEN
//语义理解post
Wechat.prototype.semantic = function(semanticData) {
    var that = this;
    return new Promise(function(resolve, reject) {
        that.fetchAccessToken()
            .then(function(data) {
                var url = 'https://api.weixin.qq.com/semantic/semproxy/search?access_token=' + data.access_token;
                request({ method: 'POST', url: url, body: semanticData, json: true })
                    .then(function(response) {
                        that.errMsg(response['body']);
                        var redata = response['body'];
                        if (redata) {
                            resolve(redata);
                        } else {
                            throw new Error('语义理解失败')
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
    // console.log('拼接消息之前');
    // console.log(this);
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