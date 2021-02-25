var app = getApp();
var request = app.request;
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;
var util = require('../../../utils/util.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        list: null,
        currentPage: 1
    },

    onLoad: function () {
        var that = this;
        load.init(this, '', 'list');
        this.requestReturnGoods();
    },

    onShow: function () {
        if (wx.getStorageSync('user:return_goods_list:update')) {
            wx.setStorageSync('user:return_goods_list:update', false);
            this.resetData();
            this.requestReturnGoods();
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.resetData();
        this.requestReturnGoods();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (load.canloadMore()) {
            this.requestReturnGoods();
        }
    },

    requestReturnGoods: function () {
        var that = this;
        var requestUrl = that.data.url + '/api/order/return_goods_list?p=' + that.data.currentPage;
        load.request(requestUrl, function (res) {
            that.data.currentPage++;
            res.data.result.forEach(function (val, index, arr) {
                val.addTimeFommat = util.formatTime(val.addtime);
            });
            wx.stopPullDownRefresh();
        });
    },

    resetData: function () {
        this.data.currentPage = 1;
        this.data.list = null;
        load.resetConfig();
    },

    /** 确认收货 */
    receiveOrder: function (e) {
        var that = this;
        var return_id = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确定已收货？',
            success: function (res) {
                if (res.confirm) {
                    request.post('/api/order/receiveConfirm', {
                        data: { return_id: return_id },
                        success: function (res) {
                            that.resetData();
                            that.requestReturnGoods();
                        }
                    });
                }
            }
        });
    },

    /** 取消退换货 */
    cancelReturn: function (e) {
        var that = this;
        var return_id = e.currentTarget.dataset.id;
        wx.showModal({
            title: '确定取消售后服务？',
            success: function (res) {
                if (res.confirm) {
                    request.post('/api/order/return_goods_cancel', {
                        data: { id: return_id },
                        success: function (res) {
                            that.resetData();
                            that.requestReturnGoods();
                        }
                    });
                }
            }
        });
    }

})