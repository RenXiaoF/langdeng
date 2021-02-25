var app = getApp();
var request = app.request;
var setting = app.globalData.setting;
import Category from '../../../utils/category/Category.js';

Page({
    data: {
        url: setting.url,
        categorydata: null,
        storeTypes: [
            { id: 1, name: '旗舰店'}, 
            { id: 2, name: '专卖店'}, 
            { id: 3, name: '专营店'}
        ],
        storeType: -1,
    },

    onLoad: function (options) {
        this.initCategory();
    },

    /** 初始化经营类目弹框相关 */
    initCategory: function () {
        var that = this;
        new Category(this, 'categories', {
            endCall: function (categories) {
                that.setData({ categorydata: categories });
            }
        });
    },

    submitInfo: function (e) {
        var data = e.detail.value;
        Object.assign(data, {
            store_type: this.data.storeTypes[this.data.storeType].id,
            'store_class_ids[]': this.data.categorydata.category3
        });
        request.post('/api/newjoin/storeInfo', {
            data: data,
            success: function (res) {
                wx.redirectTo({ url: '/pages/newjoin/join3/join3' });
            }
        });
    },

    selectStoreType: function (e) {
        this.setData({ storeType: e.detail.value })
    }

})