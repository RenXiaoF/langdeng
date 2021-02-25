var app = getApp();
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;
var util = require('../../../utils/util.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        recharges: null, //请求的充值记录
        currentPage: 1
    },

    onLoad: function () {
        load.init(this, '', 'recharges');
        this.requestChangeList();
    },

    requestChangeList: function () {
        var that = this;
        var requestUrl = '/api/user/recharge_list/' + '?p=' + that.data.currentPage;
        load.request(requestUrl, function (res) {
            that.data.currentPage++;
            res.data.result.forEach(function (val, index, arr) {
                val.cTimeFommat = util.format(val.ctime, 'yyyy-MM-dd');
            });
            wx.stopPullDownRefresh();
        });
    },

    onReachBottom: function () {
        if (load.canloadMore()) {
            this.requestChangeList();
        }
    },

    onPullDownRefresh: function () {
        this.data.recharges = null;
        this.data.currentPage = 1;
        load.resetConfig();
        this.requestChangeList();
    }

});