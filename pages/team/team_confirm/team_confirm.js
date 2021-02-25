var app = getApp();
var request = app.request;
var common = require('../../../utils/common.js');
var util = require('../../../utils/util.js');
var md5 = require('../../../utils/md5.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        optionOrderPay: false, //是否是订单支付
        optionOrderSn: '', //订单sn
        address: null,
        mOrder: null, //原始订单数据(用来判断该订单是否已经选择了地址)
        order: null, //请求的订单数据
        goods: null,
        store: null,
        coupons: null, //可用的优惠券
        userInfo: null, //用户信息
        payWithUserMoney: true, //是否使用余额支付
        payWithPoints: true, //是否使用积分支付
        maxWord: 0,
        enterAddressPage: false,
        firstEnter: true, //是否第一次进入页面
        coupon: null, //已使用的优惠券
        goodsInputNum: 1, //商品数量
        formData: {
            pay_points: '',
            user_money: '',
            user_note: '',
            paypwd: '',
        }
    },

    onLoad: function (options) {
        var orderPay = typeof options.orderPay == 'undefined' ? false : options.orderPay;
        var orderSn = typeof options.orderSn == 'undefined' ? '' : options.orderSn;
        this.setData({ 
            optionOrderPay: orderPay,
            optionOrderSn: orderSn,
        });
        this.requestTeamOrder();
    },

    //重新加载数据
    onShow: function () {
        this.setData({ order: this.data.order });
        if (this.data.enterAddressPage) {
            this.data.enterAddressPage = false;
            var addressId = wx.getStorageSync('team:confirm:address_id');
            if (addressId !== '') {
                wx.removeStorageSync('team:confirm:address_id');
            } else {
                addressId = this.data.address == null ? '' : this.data.address.address_id;
            }
            this.requestTeamOrder(addressId); //改变地址要重新请求数据
        } else if (!this.data.firstEnter && this.checkAddressList()) {
            var conponUse = wx.getStorageSync('team:confirm:cid');
            this.setData({ coupon: conponUse });
            this.calculatePrice();
        }
        this.data.firstEnter = false;
    },

    requestTeamOrder: function (addressId) {
        var that = this;
        var data={
            address_id: addressId ? addressId : 0,
            order_sn: this.data.optionOrderSn,
        };
        request.get('/api/Team/order', {
            failRollback: true,
            data: data,
            success: function (res) {
                var result = res.data.result;
                that.setData({ address: result.addressList });
                that.setData({ mOrder: result.order });
                that.setData({ order: result.order });
                that.setData({ goods: result.order_goods });
                that.setData({ goodsInputNum: result.order_goods.goods_num });
                that.setData({ store: result.store });
                that.setData({ coupons: result.userCartCouponList });
                that.setData({ userInfo: result.userInfo });
                if (that.checkAddressList()) {
                    that.calculatePrice();
                }
            },
            failStatus: function (res) {
                if (res.data.status == 0) {
                    wx.showModal({
                        title: res.data.msg,
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                that.enterAddressPage();
                            } else {
                                wx.navigateBack();
                            }
                        },
                        fail: function () {
                            wx.navigateBack();
                        }
                    });
                }
                return false;
            }
        });
    },

    /** 检查是否已经选了地址 */
    checkAddressList: function () {
        var that = this;
        if (this.data.address == null) {
            wx.showModal({
                title: '请先填写或选择收货地址~',
                success: function (res) {
                    if (res.confirm) {
                        that.enterAddressPage();
                    } else {
                        wx.navigateBack();
                    }
                },
                fail: function () {
                    wx.navigateBack();
                }
            });
            return false;
        }
        return true;
    },

    keyUpChangePay1:function(e) {
        this.setData({
            payWithUserMoney: e.detail.value.length > 0 ? false : true
        });
    },

    keyUpChangePay2: function (e) {
        this.setData({
            payWithPoints: e.detail.value.length > 0 ? false : true
        });
    },
    
    keyUpChangeNum:function(e) {
        this.setData({
            maxWord: e.detail.value.length
        });
    },

    /** 减少购买的商品数量 */
    reduce: function(){
        var num = this.data.goodsInputNum - 1;
        if (num < 1) {
            num = 1;
        }
        this.setData({ goodsInputNum: num });
        this.calculatePrice();
    },

    /** 增加购买的商品数量 */
    add: function(){
        var num = this.data.goodsInputNum + 1;
        this.setData({ goodsInputNum: num });
        this.calculatePrice();
    },

    /** 输入购买的数量 */
    inputNum: function (e) {
        var num = Number(e.detail.value);
        if (num < 1) {
            num = 1;
        }
        this.setData({ goodsInputNum: num });
        this.calculatePrice();
    },

    /** 请求计算价格，无入参则使用已保存的参数 */
    calculatePrice: function () {
        var that = this;
        var formData = that.data.formData;
        var postData = {
            address_id: that.data.address.address_id,
            order_id: that.data.order.order_id,
            goods_num: that.data.goodsInputNum,
            coupon_id: that.data.coupon ? that.data.coupon.id : '',
            user_note: formData.user_note,
            pay_points: formData.pay_points ? formData.pay_points : 0,
            user_money: formData.user_money ? formData.user_money : 0,
        };
        request.get('/api/Team/getOrderInfo', {
            data: postData,
            success: function (res) {
                var result = res.data.result;
                that.setData({ order: result.order });
                that.setData({ goods: result.order_goods });
                that.setData({ coupons: result.couponList });
            },
        });
    },

    /** 提交订单 */
    submitForm: function (e) {
        var that = this;
        var formData = e.detail.value;
        this.data.formData = formData;
        if (e.detail.target.id != 'submitOrder') {
            this.calculatePrice();
            return;
        }
        var pwd = formData.paypwd ? md5('TPSHOP' + formData.paypwd) : '';
        var postData = {
            address_id: this.data.address.address_id,
            order_id: this.data.order.order_id,
            goods_num: this.data.goodsInputNum,
            coupon_id: this.data.coupon ? this.data.coupon.id : '',
            user_note: formData.user_note,
            pay_points: formData.pay_points ? formData.pay_points : 0,
            user_money: formData.user_money ? formData.user_money : 0,
            paypwd: pwd,
            act: 'submit_order',
        };
        request.post('/api/Team/getOrderInfo', {
            data: postData,
            success: function (res) {
                var result = res.data.result;
                if (result.order_amount <= 0) {
                    wx.setStorageSync('team:order_list:update', true);
                    wx.redirectTo({
                        url: '/pages/payment/payment/payment?order_sn=' + that.data.optionOrderSn + '&order_amount=' + that.data.order.total_amount + '&is_group=true'
                    });
                } else {
                    common.jumpToCart4({
                        master_order_sn: that.data.optionOrderSn
                    }, 1);
                }
            },
            failStatus: function (res) {
                if (res.data.status == -1) {
                    wx.showModal({
                        title: '请先设置支付密码',
                        success: function (res) {
                            if (res.confirm) {
                                wx.navigateTo({ url: '/pages/user/userinfo/userinfo' });
                            } else {
                                wx.navigateBack();
                            }
                        },
                        fail: function () {
                            wx.navigateBack();
                        }
                    });
                }
            }
        });
    },

    /** 使用优惠券 */
    useCoupon: function (e) {
        var num = this.data.coupons ? this.data.coupons.length : 0;
        if(num <= 0){
            return app.showWarning("无可用优惠券");
        }
        var params={
            lid: this.data.coupon ? this.data.coupon.id : '0',
        };
        wx.navigateTo({ url: '/pages/team/team_coupon/team_coupon?' + util.Obj2Str(params) });
    },

    enterAddressPage: function() {
        if (this.data.optionOrderPay && this.data.mOrder.province != 0){ //订单支付并且之前已经选择地址
            return;
        }
        this.data.enterAddressPage = true;
        wx.navigateTo({ url: '/pages/user/address_list/address_list?operate=teamSelect' });
    },

})