var app = getApp();
var request = app.request;
var pay = require('../../../utils/pay.js');
var util = require('../../../utils/util.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        order: {},
        useWxPay: true
    },

    onLoad: function (options) {
        var that = this;
        this.data.order.is_virtual = options.is_virtual;
        if (options.master_order_sn) {
            request.get('/api/cart/cart4', {
                data: { master_order_sn: options.master_order_sn },
                failRollback: true,
                success: function (res) {
                    var order_amount = res.data.result;
                    /**如果浮点的订单金额<0.01，就跳到success */
                    if (parseFloat(order_amount) < 0.01) {
                        that.jumpSuccess();
                    }
                    that.setData({ 
                        order: {
                            order_sn: options.master_order_sn,
                            order_amount: order_amount
                        }
                    });
                }
            });
        } else {
            if (parseFloat(options.order_amount) < 0.01) {
                this.jumpSuccess();
            }
            this.setData({ order: options });
        }
    },

    checkPayWay: function () {
        this.setData({
            useWxPay: !this.data.useWxPay
        });
    },

    payment: function () {
        var that = this;
        //订单号+金额
        if (this.data.order && parseFloat(this.data.order.order_amount) < 0.01) {
            this.jumpSuccess();
            return;
        }

        //true;
        if (that.data.useWxPay) {
            //微信支付
            pay.pay(this.data.order.order_sn, function () {
                that.jumpPaymentPage();
            });
        } else {
            //货到付款
            request.post('/api/payment/pay_arrival', {
                data: { order_id: that.data.orderId },
                success: function (res) {
                    that.jumpsuccess();
                }
            });
        }
    },
    /**调到成功 */
    jumpSuccess: function () {
        var that = this;
        app.showSuccess('下单成功', function () {
            var pages = getCurrentPages();
            if (that.data.order.is_virtual) {
                if (pages[pages.length - 2].route == 'pages/goods/goodsInfo/goodsInfo') {
                    //前一个页面是商品详情页，则跳到待发货页
                     wx.redirectTo({ url: '/pages/virtual/virtual_list/virtual_list?type=2' });
                } else {
                    wx.setStorageSync('virtual:virtual_list:update', true);
                    wx.setStorageSync('order:order_detail:update', true);
                    wx.navigateBack();
                }
            } else {
                if (pages[pages.length - 2].route == 'pages/cart/cart/cart') {
                    //前一个页面是购物车页，则跳到待发货页
                    wx.redirectTo({ url: '/pages/user/order_list/order_list?type=2' });
                } else {
                    wx.setStorageSync('order:order_list:update', true);
                    wx.setStorageSync('order:order_detail:update', true);
                    wx.navigateBack();
                }
            }
            
        });
    },
    /**跳转到支付页面 */
    jumpPaymentPage: function () {
        wx.setStorageSync('order:order_list:update', true);
        wx.redirectTo({
            url: '/pages/payment/payment/payment?order_sn=' + this.data.order.order_sn + '&order_amount=' + this.data.order.order_amount
        });
    }
})