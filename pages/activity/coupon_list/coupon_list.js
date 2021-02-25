var app = getApp();
var request = app.request;
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        data: null,
        typeId: 1,
        currentPage: 1
    },

    onLoad: function () {
        load.init(this, 'coupon_list', 'data');
        this.requestCouponList(this.data.typeId);
    },

    changeTab: function (e) {
        this.reloadCouponList(e.currentTarget.dataset.id);
    },

    requestCouponList: function (typeId) {
        var that = this;
        that.setData({ typeId: typeId });
        var requestUrl = '/api/activity/coupon_list?type=' + typeId + '&p=' + that.data.currentPage;
        load.request(requestUrl, function (res) {
            that.data.currentPage++;
            for (var i = 0; i < res.data.result.coupon_list.length; i++) {
                var val = res.data.result.coupon_list[i];
                if (val.isget == 1) {
                    res.data.result.coupon_list.splice(i--, 1);
                    continue;
                }
                val.store_name = res.data.result.store_arr[val.store_id].store_name;
                val.percent = val.createnum > 0 ? Math.ceil(val.send_num / val.createnum * 100) : 0;
            }
            that.getCouponRate(res.data.result.coupon_list);
            wx.stopPullDownRefresh();
        });
    },

    onReachBottom: function () {
        if (load.canloadMore()) {
            this.requestCouponList(this.data.typeId);
        }
    },

    onPullDownRefresh: function () {
        this.reloadCouponList(this.data.typeId);
    },

    //重置数据
    reloadCouponList: function (typeId) {
        load.resetConfig();
        this.data.data = null;
        this.data.currentPage = 1;
        this.requestCouponList(typeId);
    },

    /** 领券 */
    getCoupon: function (e) {
        var that = this;
        var coupon_id = e.currentTarget.dataset.cid;
        request.post('/api/activity/get_coupon', {
            data: { coupon_id: coupon_id },
            success: function (res) {
                app.showSuccess(res.data.msg);
                var coupons = that.data.data.coupon_list;
                for (var i in coupons) {
                    if (coupons[i].id == coupon_id) {
                        coupons.splice(i, 1);
                        that.setData({ 'data.coupon_list': coupons });
                        break;
                    }
                }
            }
        });
    },

    /** 获取所有优惠券领券进度 */
    getCouponRate: function (coupons){
        for (var i in coupons){
            var id = coupons[i].id;
            var rate = (coupons[i].percent) / 100;
            this.createCircle(id, rate);
        }
    },

    /** 画领取进度 */
    createCircle: function (id,rate) {
        var context = wx.createCanvasContext(id);
        context.beginPath();
        context.setStrokeStyle("#8e8e8e");
        context.setLineWidth(3);
        context.setLineCap('round');
        context.arc(38, 35, 31, 0.75 * Math.PI, 2.25 * Math.PI, false);
        context.stroke();
        if(rate > 0){
            context.beginPath();
            context.setLineWidth(3);
            context.setStrokeStyle("#ffffff");
            context.setLineCap('round');
            context.arc(38, 35, 31, 0.75 * Math.PI, (rate * 1.5 + 0.75) * Math.PI, false);
            context.stroke();
        }
        context.draw();
    },

});