var app = getApp();
var request = app.request;
var util = require('../../../utils/util.js');
var common = require('../../../utils/common.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        order: null,
        optionIsGoup: false, //是否是拼团
        user_note: '',
    },

    onLoad: function (options) {
        var isGoup = typeof options.isGoup == 'undefined' ? false : options.isGoup;
        this.setData({ optionIsGoup: isGoup });
        this.requestOrderDetail(options.order_id);
        wx.removeStorageSync('order:order_detail:update');
    },

    onShow: function () {
        if (wx.getStorageSync('order:order_detail:update')) {
            wx.removeStorageSync('order:order_detail:update');
            this.requestOrderDetail(this.data.order.order_id);
        }
    },

    requestOrderDetail: function (order_id) {
        var that = this;
        request.get(that.data.url + '/api/order/order_detail?id=' + order_id, {
            success: function (res) {
                var order = res.data.result;
                order.addTimeFormat = util.format(order.add_time);
                for (var i = 0; i < order.vrorder.length; i++) {
                    order.vrorder[i].vrIndateFormat = util.format(order.vrorder[i].vr_indate, 'yyyy-MM-dd hh:mm');
                    order.vrorder[i].vrUsertimeFormat = util.format(order.vrorder[i].vr_usetime, 'yyyy-MM-dd hh:mm');
                }
                that.setData({ 
                    order: order,
                    user_note: unescape(order.user_note),
                });
            }
        });
    },

    contactService: function () {
        if (this.data.order.store.store_phone){
            app.confirmBox('请联系客服：' + this.data.order.store.store_phone);
        }else{
            app.showWarning("没有联系方式");
        }
    },

    /** 取消订单 */
    cancelOrder: function (e) {
        var that = this;
        var orderId = e.currentTarget.dataset.id;
        wx.showModal({
            title: '是否取消订单？',
            success: function (res) {
                if (res.confirm) {
                    request.post('/api/user/cancelOrder', {
                        data: { order_id: orderId },
                        success: function (res) {
                            that.requestOrderDetail(orderId);
                            wx.setStorageSync('order:order_list:update', true);
                        }
                    });
                }
            }
        });
    },

    /** 确认收货 */
    confirmOrder: function (e) {
        var that = this;
        var orderId = this.data.order.order_id;
        wx.showModal({
            title: '确定已收货？',
            success: function (res) {
                if (res.confirm) {
                    request.post('/api/user/orderConfirm', {
                        data: { order_id: orderId },
                        success: function (res) {
                            that.requestOrderDetail(orderId);
                            wx.setStorageSync('order:order_list:update', true);
                        }
                    });
                }
            }
        });
    },

    /** 立即付款 */
    jumpToCart4: function (e) {
        if (this.data.optionIsGoup){
            wx.navigateTo({
                url: '/pages/team/team_confirm/team_confirm?orderSn=' + this.data.order.order_sn + '&orderPay=true',
            })
        }else{
            common.jumpToCart4({
                order_sn: this.data.order.order_sn,
                order_amount: this.data.order.order_amount,
            }, 1);
        }
    },

    checkTeam: function(){
        wx.navigateTo({
            url: '/pages/team/team_detail/team_detail?foundId=' + this.data.order.orderTeamFound.found_id,
        });
    },

});