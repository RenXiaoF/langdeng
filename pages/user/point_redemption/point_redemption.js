// pages/user/point_redemption/point_redemption.js
var app = getApp();
var request = app.request;
var common = require('../../../utils/common.js');
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        ordertypes: [
            { name: '全部', id: 0, },
            //   { name: '未付款', id: 1, },
            { name: '待发货', id: 2, },
            { name: '待收货', id: 3, },
            { name: '已完成', id: 4, }
        ],
        storelist: null, // 请求的订单列表
        activeCategoryId: 0, // 顶部标题的默认索引
        currentPage: 1 // 当前页面
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      console.log("我的积分订单",options);
        // 顶部标题的传入的索引
        var id = typeof options.type == 'undefined' ? this.data.activeCategoryId : options.type;
        // 负载初始化
        load.init(this, '', 'pointsRedemption');
        // 获取积分订单列表
        this.getorderlist(id);
    },
 
    onShow: function () {
        if (wx.getStorageSync('order:points_redemption:update')) {
            wx.setStorageSync('order:points_redemption:update', false);
            this.resetData();
            this.getorderlist(this.data.activeCategoryId);
        }
    },

    /**切换表头 */
    changeTab: function (e) {
      console.log("切换表头",e);
        this.resetData();
        this.getorderlist(e.currentTarget.id);
    },
    //重置数据
    resetData: function () {
        load.resetConfig();
        this.data.storelist = null;
        this.data.currentPage = 1;
    },

    /**获取订单列表 */
    getorderlist: function (categoryId) {
        var that = this;
        // var requestUrl = that.data.url + "Order/order_list";
        var requestUrl = "Order/order_list";
        var tabType = '';
        if (categoryId == 0) {
            tabType = '';
        }
        // else if (categoryId == 1) {
        //     tabType = 'WAITPAY';
        // }
        else if (categoryId == 2) {
            tabType = 'WAITSEND';
        }
        else if (categoryId == 3) {
            tabType = 'WAITRECEIVE';
        }
        else if (categoryId == 4) {
            tabType = 'WAITCCOMMENT'
        }
        if (tabType) {
            requestUrl += '?type=' + tabType;
        }
        that.setData({ activeCategoryId: categoryId });
        // requestUrl = requestUrl + '?p=' + that.data.currentPage;
        request.post(requestUrl, {
            data: {
                start_time: '',
                end_time: '',
                type: tabType,
                search_key: '',
            },
            success: function (res) {
                console.log("积分兑换订单列表", res.data.result);
                if (res.data.status == 1) {
                    that.setData({ storelist: res.data.result })
                } else if (res.data.status == -1) {
                    // that.setData({ storelist: res.data.result })
                    wx.showToast({
                        title: res.data.msg,
                        icon: 'none',
                        image: '',
                        duration: 1500,
                    });
                }
            }
        })
    },
    /** 确认收货 */
    confirmOrder: function (e) {
        var that = this;
        var orderId = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确定已收货？',
            success: function (res) {
                if (res.confirm) {
                    request.post('Consumer/integral_receiving_order', {
                        data: { order_id: orderId },
                        success: function (res) {
                            that.deleteOrderData(orderId);
                        }
                    });
                }
            }
        });
    },

    // 立即付款 ??? 
    // 还没有支付页面
    gotofacbuy: function (e) {
        var order = this.data.storelist[e.currentTarget.dataset];
        common.pay({
            total_amount: order.idx.order_amount,
            order_sn: order.idx.order_sn,
            order_id: order.id
        })
    },


})