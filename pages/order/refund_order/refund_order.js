var app = getApp();
var setting = app.globalData.setting;
var request = app.request;

Page({
    data: {
        url: setting.url,
        resourceUrl: setting.resourceUrl,
        openReasonModal: false, //是否打开地区弹框
        order: null,
        reasonSelect: 0, //选择取消订单的原因
        reasonList: [
            '订单不能按预计时间送达', '操作有误(商品、地址等选错)', '重复下单/误下单',
            '其他渠道价格更低', '该商品降价了', '不想买了', '其他原因'
        ]
    },

    onLoad: function (options) {
        this.setData({ order: options });
    },

    /** 已付款未发货的取消订单 */
    refundOrder: function (e) {
        var that = this;
        request.post('/api/order/refund_order', {
            data: {
                order_id: that.data.order.orderId,
                user_note: that.data.reasonList[that.data.reasonSelect],
                consignee: e.detail.value.consignee,
                mobile: e.detail.value.mobile
            },
            success: function (res) {
                wx.showToast({
                    title: '已提交申请',
                    mask: true,
                    duration: 1000,
                    complete: function () {
                        wx.setStorageSync('order:order_list:update', true);
                        wx.setStorageSync('order:order_detail:update', true);
                        setTimeout(function () {
                            wx.navigateBack();
                        }, 1000);
                    }
                });
            }
        });
    },

    openReasonModal: function () {
        this.setData({ openReasonModal: true });
    },

    closeReasonModal: function () {
        this.setData({ openReasonModal: false });
    },

    /** 改变取消订单理由 */
    reasonChange: function (e) {
        this.setData({ reasonSelect: e.detail.value });
    }

});