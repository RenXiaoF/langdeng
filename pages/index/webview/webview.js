var app = getApp();
var request = app.request;
var setting = app.globalData.setting;
var util = require('../../../utils/util.js');

Page({
    data: {
        webUrl: '',
    },

    onLoad: function (options) {
        var url = request.modifyUrl(options._url);
        delete options._url;
        var params = util.Obj2Str(options); //剩下的参数拼成get参数
        this.setData({ webUrl: url + '&' + params });
        app.showLoading(null, 1500);
    },
    
})