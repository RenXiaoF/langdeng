var app = getApp();
var request = app.request;
var util = require('../../../utils/util.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        coupons: null,
        lid: -1, //使用的优惠券id
    },

    onLoad: function (options) {
        var pages = getCurrentPages(); //获取页面栈
        if (pages.length > 1) {
            var prePage = pages[pages.length - 2]; //上一个页面实例对象
            prePage.data.coupons.forEach(function (val, index, arr) {
                val.deadTimeFommat = util.format(val.use_end_time, 'yyyy-MM-dd');
            });
            this.setData({ coupons: prePage.data.coupons });
        }
        if (typeof options.lid != 'undefined'){
            this.setData({ lid: options.lid });
        }
    },

    /** 使用优惠券 */
    useCoupon: function (e) {
        //设置cart2的变量，传递参数
        var coupon = this.data.coupons[e.currentTarget.dataset.idx];
        if (this.data.lid != coupon.id) {  //立即使用
            wx.setStorageSync('team:confirm:cid', coupon);
        } else {  //取消使用
            wx.removeStorageSync('team:confirm:cid');
        }
        wx.navigateBack();
    }

});