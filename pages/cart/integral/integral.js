var app = getApp();
var request = app.request;
var common = require('../../../utils/common.js');
var util = require('../../../utils/util.js');
var md5 = require('../../../utils/md5.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        goods: null,
        order: null, //请求的订单数据
        orderPrices: null, //请求的订单价格数据
        payWithUserMoney: true, //是否使用余额支付
        maxWord: 0,
        enterAddressPage: false,
        invoice: {
            is_use: false, //是否开发票
            is_person: true, //是否是个人
            contents: ['明细', '耗材', '办公用品', '电脑配件', '食品酒水', '服饰鞋帽', '日用品', '电器数码', '家具建材', '钟表珠宝', '日化用品'],
            content_idx: 0, //发票内容下标
        },
        formData: {
            invoice_title: '',
            user_money: '',
            paypwd: '',
            user_note: '',
        }
    },

    onLoad: function (options) {
        this.setData({ goods: options });
        this.requestCart2(0);
    },

    //重新加载数据
    onShow: function () {
        this.setData({ order: this.data.order });
        if (this.data.enterAddressPage) {
            this.data.enterAddressPage = false;
            var addressId = wx.getStorageSync('cart:cart2:address_id');
            if (addressId !== '') {
                wx.removeStorageSync('cart:cart2:address_id');
            } else {
                addressId = (!this.data.order || this.data.order.addressList == null) ? 0 : this.data.order.addressList.address_id;
            }
            this.requestCart2(addressId); //改变地址要重新请求数据
        }
    },

    requestCart2: function (addressId) {
        var that = this;
        request.post('/api/cart/integral', {
            failRollback: true,
            data: {
                address_id: addressId,
                goods_id: this.data.goods.goods_id,
                item_id: this.data.goods.item_id,
                goods_num: this.data.goods.goods_num,
            },
            success: function (res) {
                that.setData({ order: res.data.result });
                that.setData({ 'order.addressList': res.data.result.userAddress });
                res.data.result.goods.goods_num = res.data.result.goods_num;
                res.data.result.goods.goods_price = res.data.result.goods_price;
                that.setData({ 'order.cartList': [res.data.result.goods] });
                if (that.checkAddressList()) {
                    that.calculatePrice();
                }
            },
            failStatus: function (res) {
                if (res.data.status == -1) {
                    that.setData({ order: null });
                    that.checkAddressList();
                }
                return false;
            }
        });
    },

    /** 检查是否已经选了地址 */
    checkAddressList: function () {
        var that = this;
        if (!this.data.order || this.data.order.addressList == null) {
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

    /** 显示发票信息 */
    setInvoice: function (e) {
        this.setData({ 'invoice.is_use': e.detail.value });
    },

    isPersonChange: function (e) {
        if (e.detail.value == 'person') {
        } else {
        }
        this.setData({ 'invoice.is_person': e.detail.value == 'person' });
    },

    selectInvoiceContent: function (e) {
        this.setData({ 'invoice.content_idx': e.detail.value })
    },

    getInvoiceData: function (form) {
        var invoice = this.data.invoice;
        if (!invoice.is_use) {
            return {};
        }
        return {
            invoice_title: invoice.is_person ? '个人' : form.invoice_title,
            taxpayer: invoice.is_person ? '' : form.taxpayer,
            invoice_desc: invoice.contents[invoice.content_idx],
        };
    },

    keyUpChangePay1: function (e) {
        this.setData({
            payWithUserMoney: e.detail.value.length > 0 ? false : true
        });
    },

    keyUpChangeNum: function (e) {
        this.setData({
            maxWord: e.detail.value.length
        });
    },

    /** 请求计算价格，无入参则使用已保存的参数 */
    calculatePrice: function (formData, submitOrder) {
        var that = this;
        if (typeof formData == 'undefined') {
            formData = that.data.formData;
        } else {
            that.data.formData = formData;
        }
        var pwd = formData.paypwd ? md5('TPSHOP' + formData.paypwd) : '';
        var postData = {
            address_id: that.data.order.addressList.address_id,
                invoice_title: formData.invoice_title ? formData.invoice_title : '',
                user_money: formData.user_money ? formData.user_money : 0,
                pwd: pwd,
                act: submitOrder ? 'submit_order' : '',
                goods_id: this.data.goods.goods_id,
                item_id: this.data.goods.item_id,
                goods_num: this.data.goods.goods_num,
                user_note: formData.user_note ? formData.user_note:'',
            };
        postData = Object.assign(postData, that.getInvoiceData(formData));
        request.post('/api/cart/integral2', {
            data: postData,
            success: function (res) {
                if (!submitOrder) {
                    that.setData({ orderPrices: res.data.result });
                    return;
                }
                if (that.data.orderPrices.order_amount <= 0) {
                    wx.setStorageSync('order:order_list:update', true);
                    wx.redirectTo({
                        url: '/pages/payment/payment/payment?order_sn=' + res.data.result + '&order_amount=' + that.data.orderPrices.total_amount
                    });
                    return;
                }
                common.jumpToCart4({
                    master_order_sn: res.data.result,
                }, 1);
            },
            failStatus: function (res) {
                if (res.data.status == 0){
                    wx.navigateBack();
                }else if (res.data.status == -1) {
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

    /** 提交订单 */
    submitForm: function (e) {
        var submitOrder = (e.detail.target.id == 'submitOrder') ? true : false;
        this.calculatePrice(e.detail.value, submitOrder);
    },

    enterAddressPage: function () {
        this.data.enterAddressPage = true;
        wx.navigateTo({ url: '/pages/user/address_list/address_list?operate=select' });
    },

    addCouponCode: function () {
        var that = this;
        request.post('/api/cart/coupon_exchange', {
            data: { coupon_code: this.data.couponCode },
            success: function (res) {
                that.requestCart2(that.data.order.addressList.address_id);
                app.confirmBox('兑换成功，限用于' + res.data.result.coupon.limit_store);
            }
        });
    }

})