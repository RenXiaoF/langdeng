var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var util = require("../../../utils/util.js");
var common = require("../../../utils/common.js");

Page({
    data: {
        url: setting.url,
        resourceUrl: setting.resourceUrl,
        return_goods: null, //请求的数据
        goods: null,         //请求的数据
        return_method: [],    //售后方式
        barStepsNum:4,  
        platformName: '商城',
    },

    onLoad: function (options) {
        this.requestReturnGoods(options.id);
        var that = this;
        app.getConfig(function(config) {
            var name = common.getConfigByName(config.config, 'store_name', 'shop_info');
            that.setData({ platformName: name });
        });
    },

    requestReturnGoods: function (id) {
        var that = this;
        request.get('/api/order/return_goods_info', {
            failRollback: true,
            data: { id: id },
            success: function (res) {
                var return_goods = res.data.result.return_goods;
                return_goods.addTimeFormat = util.format(return_goods.addtime);
                if (return_goods.seller_delivery && typeof return_goods.seller_delivery == 'object'
                    && typeof return_goods.seller_delivery.express_time == 'number') {
                    return_goods.seller_delivery.expressTimeFormat
                        = util.format(return_goods.seller_delivery.express_time);
                }
                that.setData({
                    return_goods: return_goods,
                    goods: res.data.result.goods,
                    return_method: res.data.result.return_method,
                });
            }
        });
    },

    /** 确认收货 */
    receiveOrder: function () {
        var that = this;
        var return_id = this.data.return_goods.id;
        wx.showModal({
            title: '确定已收货？',
            success: function (res) {
                if (res.confirm) {
                    request.post('/api/order/receiveConfirm', {
                        data: { return_id: return_id },
                        success: function (res) {
                            wx.setStorageSync('user:return_goods_list:update', true);
                            that.requestReturnGoods(return_id);
                        }
                    });
                }
            }
        });
    },

    /** 取消退换货 */
    cancelReturn: function () {
        var that = this;
        var return_id = this.data.return_goods.id;
        wx.showModal({
            title: '确定取消售后服务？',
            success: function (res) {
                if (res.confirm) {
                    request.post('/api/order/return_goods_cancel', {
                        data: { id: return_id },
                        success: function (res) {
                            wx.setStorageSync('user:return_goods_list:update', true);
                            that.requestReturnGoods(return_id);
                        }
                    });
                }
            }
        });
    },

    /** 预览图片 */
    previewImgs: function (e) {
        var that = this;
        var imgs = this.data.return_goods.imgs;
        imgs = imgs.map(function (val) {
            return that.data.url + val;
        });
        wx.previewImage({ 
            current: imgs[e.currentTarget.dataset.idx],
            urls: imgs 
        });
    },

    /** 提交发货信息 */
    submitInfo: function (e) {
      var that = this;
      var return_id = this.data.return_goods.id;
      console.log(e.detail.value);
      var data = e.detail.value;
      if (!data.invoice_no || !data.invoice_name) {
        return app.showWarning('请先填完信息');
      }
      data.return_id = return_id;
      request.post('/api/order/return_goods_invoice', {
        data: data,
        success: function (res) {
          wx.setStorageSync('user:return_goods_list:update', true);
          that.requestReturnGoods(return_id);
        }
      });
    },

});