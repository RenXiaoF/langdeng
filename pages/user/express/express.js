var app = getApp();
var request = app.request;

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        delivery: null, //物流信息
        express: null, //快递信息
        error: '快递信息异常',
    },

    onLoad: function (option) {
        this.requestDelivery(option.order_id);
    },

    requestDelivery: function (orderId) {
        var that = this;
        request.get('/api/user/express', {
            data: { order_id: orderId },
            success: function (res) {
                that.setData({ delivery: res.data.result });
                that.requestExpress();
            }
        });
    },

    requestExpress: function () {
        var that = this;
        wx.request({
            url: this.data.url + '/home/api/queryExpress',
            data: {
                shipping_code: this.data.delivery.shipping_code,
                invoice_no: this.data.delivery.invoice_no
            },
            success: function (res) {
                console.log('success', res);
                that.setData({ express: res.data });
            },
            fail: function (res) {
                app.showWarning('请求失败');
            }
        });
    },

})