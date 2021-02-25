var app = getApp();
var request = app.request;
var common = require('../../../utils/common.js');
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        categories: [
            { name: "全部", id: 0 },
            { name: "待付款", id: 1 },
            { name: "待成团", id: 2 },
            { name: "待发货", id: 3 },
            { name: "待收货", id: 4 },
            { name: "已完成", id: 5 },
        ],
        activeCategoryId: 0,
        orderList: null, //请求的订单列表
        currentPage: 1
    },

    onLoad: function (options) {
        var id = typeof options.type == 'undefined' ? this.data.activeCategoryId : options.type;
        load.init(this, '', 'orderList');
        this.requestOrderList(id);
        wx.removeStorageSync('team:order_list:update');
    },

    onShow: function () {
        if (wx.getStorageSync('team:order_list:update')) {
            wx.setStorageSync('team:order_list:update', false);
            this.resetData();
            this.requestOrderList(this.data.activeCategoryId);
        }
    },

    changeTab: function(e) {
        this.resetData();
        this.requestOrderList(e.currentTarget.id);
    },

    //重置数据
    resetData: function () {
        load.resetConfig();
        this.data.orderList = null;
        this.data.currentPage = 1;
    },

    /** 请求订单数据 */
    requestOrderList: function(categoryId) {
        var that = this;
        var requestUrl = that.data.url + '/api/Order/team_list';
        var tabType = '';
        if (categoryId == 1) {
            tabType = 'WAITPAY';
        } else if (categoryId == 2){
            tabType = 'WAITTEAM';
        } else if (categoryId == 3) {
            tabType = 'WAITSEND';
        } else if (categoryId == 4) {
            tabType = 'WAITRECEIVE';
        } else if (categoryId == 5) {
            tabType = 'WAITCCOMMENT'
        }
        if (tabType) {
            requestUrl += '/type/' + tabType;
        }
        this.setData({ activeCategoryId: categoryId });
        requestUrl = requestUrl + '?p=' + that.data.currentPage;
        load.request(requestUrl, function (res) {
            that.data.currentPage++;
            res.data.result.forEach(function (val, index, arr) {
                val.goods_sum = val.order_goods.reduce(function (sum, idx) {
                    return sum + idx.goods_num
                }, 0);
            });
            wx.stopPullDownRefresh();
        });
    },

    onReachBottom: function () {
        if (load.canloadMore()) {
            this.requestOrderList(this.data.activeCategoryId);
        }
    },

    onPullDownRefresh: function (e) {
        this.resetData();
        this.requestOrderList(this.data.activeCategoryId);
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
                            if (that.data.activeCategoryId == 0) {
                                that.resetData();
                                that.requestOrderList(that.data.activeCategoryId);
                            } else {
                                that.deleteOrderData(orderId);
                            }
                        }
                    });
                }
            }
        });
    },

    /** 确认收货 */
    confirmOrder: function (e) {
        var that = this;
        var orderId = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确定已收货？',
            success: function (res) {
                if (res.confirm) {
                    request.post('/api/user/orderConfirm', {
                        data: { order_id: orderId },
                        success: function (res) {
                            that.deleteOrderData(orderId);
                        }
                    });
                }
            }
        });
    },

    /** 删掉订单数据 */
    deleteOrderData: function (orderId) {
        for (var i = 0; i < this.data.orderList.length; i++) {
            if (this.data.orderList[i].order_id == orderId) {
                this.data.orderList.splice(i, 1);
                this.setData({ orderList: this.data.orderList });
                break;
            }
        }
    },

    /** 判断是否已申请退换货 */
    checkReturnGoodsStatus: function (e) {
        var recId = e.currentTarget.dataset.recid;
        request.get('/api/user/return_goods_status', {
            data: { rec_id: recId },
            success: function (res) {
                var returnId = res.data.result;
                if (returnId == 0) {
                    //未退换货
                    return wx.navigateTo({ 
                        url: '/pages/user/return_goods/return_goods?rec_id=' + recId
                    });
                }
                //已申请退换货
                wx.navigateTo({
                    url: '/pages/user/return_goods_info/return_goods_info?id=' + returnId
                });
            }
        });
    },

    /** 立即付款 */
    payNow: function(e){
        var order = this.data.orderList[e.currentTarget.dataset.idx];
        wx.navigateTo({
            url: '/pages/team/team_confirm/team_confirm?orderSn=' + order.order_sn + '&orderPay=true',
        })
    },

});