var app = getApp();
var request = app.request;
var setting = app.globalData.setting;
var util = require('../../../utils/util.js');

Page({
    data: {
        url: setting.url,
        resourceUrl: setting.resourceUrl,
        store: null, //请求的店铺信息
    },

    onLoad: function (options) {
        this.requestStore(options.store_id);
    },

    /** 请求店家信息 */
    requestStore: function (storeId) {
        var that = this;
        request.get('/api/store/about', {
            failRollBack: true,
            data: { store_id: storeId },
            success: function (res) {
                var store = res.data.result;
                store.storeTimeFormat = util.format(store.store_time, 'yyyy-MM-dd');
                that.setData({ store: store });
            }
        });
    },

    /** 关注店铺 */
    focusStore: function () {
        var that = this;
        request.post('/api/store/collectStoreOrNo', {
            data: { store_id: that.data.store.store_id },
            success: function () {
                if (!that.data.store.is_collect) {
                    app.showSuccess('关注成功');
                }
                var num = that.data.store.store_collect;
                that.setData({
                    'store.is_collect': !that.data.store.is_collect,
                    'store.store_collect': !that.data.store.is_collect ? (num + 1) : (num - 1)
                });
            }
        });
    },

    /** 联系客服 */
    contactService: function () {
        app.confirmBox('请联系客服：' + this.data.store.store_phone);
    },

    remindLookGoods: function (e) {
        var storeId = this.data.store.store_id;
        var mode = e.currentTarget.dataset.mode;
        //如果前一页是店铺详情页
        var pages = getCurrentPages();
        if (pages[pages.length - 2].route == 'pages/index/street/street') {
            wx.navigateTo({ url: '/pages/store/goods_list/goods_list?store_id=' + storeId + '&mode=' + mode });
            return;
        }
        //否则直接前往店铺街，小程序不能嵌套太深！
        app.showWarning('前往店铺街查看', function () {
            wx.switchTab({ url: '/pages/index/index/index' }); //回到首页
            wx.navigateTo({ url: '/pages/index/street/street' });
        });
    }

});