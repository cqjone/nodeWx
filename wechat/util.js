'use strict'

var xml2js = require('xml2js');
var Promise = require('bluebird');

var tpl = require('./tpl');

//解析xml数据
module.exports.parseXMLAsync = function(xml) {
    return new Promise(function(resolve, reject) {
        xml2js.parseString(xml, { trim: true }, function(err, content) {
            if (err) {
                reject(err);
            } else {
                resolve(content);
            }
        })
    })
};

//格式化解析完成的数据
function formatMessage(result) {
    var message = {};
    if (typeof result === 'object') {
        var keys = Object.keys(result); //获取对象所有的key

        for (var i = 0; i < keys.length; i++) {
            //对象的键值对
            var key = keys[i];
            var item = result[keys[i]];

            if (!(item instanceof Array) || item.length === 0) {
                continue;
            }

            if (item.length === 1) {
                var val = item[0];

                if (typeof val === 'object') {
                    message[key] = formatMessage(val);
                } else {
                    message[key] = (val || '').trim();
                }
            } else {
                message[key] = [];

                for (var j = 0; j < item.length; j++) {
                    message[key].push(formatMessage(item[j]));
                }
            }
        }
    }
    return message;
};

module.exports.formatMessage = formatMessage;

//构建回复消息的对象
module.exports.tpl = function(content, message) {
    // console.log('回复时打印');
    // console.log(content);
    var info = {};
    var type = 'text';

    info.toUserName = message.FromUserName;
    info.fromUserName = message.ToUserName;
    info.createTime = new Date().getTime();


    if (Array.isArray(content)) {
        type = 'news';
    }
    type = content.type ? content.type : type;
    info.content = content;

    info.msgType = type;
    return tpl.compiled(info);

}