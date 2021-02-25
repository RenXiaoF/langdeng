var app = getApp();
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;
var util = require('../../../utils/util.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        withdrawals: null, //请求的充值记录
        currentPage: 1
    },

    onLoad: function () {
        load.init(this, '', 'withdrawals');
        this.requestWithdrawalsList();
    },

    requestWithdrawalsList: function () {
        var that = this;
        var requestUrl = '/api/user/withdrawals_list/' + '?p=' + that.data.currentPage;
        load.request(requestUrl, function (res) {
            that.data.currentPage++;
            res.data.result.forEach(function (val, index, arr) {
                val.createTimeFommat = util.format(val.create_time, 'yyyy-MM-dd');
            });
            wx.stopPullDownRefresh();
        });
    },

    onReachBottom: function () {
        if (load.canloadMore()) {
            this.requestWithdrawalsList();
        }
    },

    onPullDownRefresh: function () {
        this.data.withdrawals = null;
        this.data.currentPage = 1;
        load.resetConfig();
        this.requestWithdrawalsList();
    }

});