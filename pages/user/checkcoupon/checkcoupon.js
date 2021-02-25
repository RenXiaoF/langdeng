var app = getApp();
var request = app.request;
var util = require('../../../utils/util.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        coupons: null,
        storeParams:{}, //当前店铺的参数
        lid: 0, //使用的优惠券id
    },

    onLoad: function (options) {
        if (typeof options.lid != 'undefined') {
            this.setData({ lid: options.lid });
        }
        this.setData({ storeParams: options });
        this.requestCoupons();
    },

    changeTab: function (e) {
        this.reloadCoupons(e.currentTarget.id);
    },

    requestCoupons: function () {
        var that = this;
        var data;
        if (that.data.storeParams.action){
            data={
                store_id: that.data.storeParams.store_id,
                money: that.data.storeParams.money,
                goods_id: this.data.storeParams.goods_id,
                item_id: this.data.storeParams.item_id,
                goods_num: this.data.storeParams.goods_num,
                action: this.data.storeParams.action,
            }
        }else{
            data={
                store_id: that.data.storeParams.store_id,
                money: that.data.storeParams.money,
            }
        }
        request.get('/api/user/getCartStoreCoupons', {
            data: data,
            success: function (res) {
                res.data.result.forEach(function (val, index, arr) {
                    val.deadTimeFommat = util.format(val.use_end_time, 'yyyy-MM-dd');
                });
                that.setData({ coupons: res.data.result });
                wx.stopPullDownRefresh();
            }
        });
    },

    onPullDownRefresh: function (e) {
        this.reloadCoupons();
    },

    //重载数据
    reloadCoupons: function () {
        this.requestCoupons();
    },

    /** 使用优惠券 */
    useCoupon: function (e) {
        //设置cart2的变量，传递参数
        var useCouponListId = 0;//取消使用
        var coupon = this.data.coupons[e.currentTarget.dataset.idx];
        if (this.data.lid != coupon.id) {
            useCouponListId = coupon.id; //立即使用
        }
        wx.setStorageSync('cart:cart2:cid', {
            useCouponListId: useCouponListId,
            useCouponName: coupon.name,
            storeId: this.data.storeParams.store_id,
        });
        wx.navigateBack();
    }

});