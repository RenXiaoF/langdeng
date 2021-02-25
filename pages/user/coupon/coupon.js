var app = getApp();
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;
var util = require('../../../utils/util.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        categories: [
            { name: "未使用", id: 0 },
            { name: "已使用", id: 1 },
            { name: "已过期", id: 2 }
        ],
        typeId: 0,
        coupons: null,
        currentPage: 1,
    },

    onLoad: function (options) {
        var typeId = typeof options.type == 'undefined' ? this.data.typeId : options.type;
        load.init(this, '', 'coupons');
        this.requestCoupons(typeId);
    },

    changeTab: function (e) {
        this.reloadCoupons(e.currentTarget.id);
    },

    requestCoupons: function (typeId) {
        var that = this;
        var requestUrl = '/api/user/getCouponList?type=' + typeId + '&p=' + that.data.currentPage;
        this.setData({ typeId: typeId });
        load.request(requestUrl, function (res) {
            that.data.currentPage++;
            res.data.result.forEach(function (val, index, arr) {
                val.deadTimeFommat = util.format(val.use_end_time, 'yyyy-MM-dd');
            });
            wx.stopPullDownRefresh();
        });
    },

    onReachBottom: function () {
        if (load.canloadMore()) {
            this.requestCoupons(this.data.typeId);
        }
    },

    onPullDownRefresh: function (e) {
        this.reloadCoupons(this.data.typeId);
    },

    //重载数据
    reloadCoupons: function (typeId) {
        load.resetConfig();
        this.setData({ coupons: null });
        this.data.currentPage = 1;
        this.requestCoupons(typeId);
    },

});