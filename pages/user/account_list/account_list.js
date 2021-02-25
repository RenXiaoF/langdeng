var app = getApp();
var request = app.request;
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;
var util = require('../../../utils/util.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        ordertypes: [
            { name: "积分", id: 0 },
            { name: "余额", id: 1 },
        ],
        activeCategoryId: 0,// 顶部标题的默认索引
        currentPage: 1,
        // accounttype: '', // 账户类型
        acc_list: [], // 账户列表
        statac: 0, // 状态
    },
    /**
    * 生命周期函数--监听页面加载
    */
    onLoad: function (options) {
        console.log("我的账户", options);
        // 顶部标题的传入的索引
        var id = typeof options.type == 'undefined' ? this.data.activeCategoryId : options.type;
        load.init(this, '', 'accounts');
        // 获得账户列表
        this.requestAccountList(id);
    },
    onShow: function () {
        if (wx.getStorageSync('order:account:update')) {
            wx.setStorageSync('order:account:update', false);
            this.resetData();
            this.requestAccountList(this.data.activeCategoryId);
        }
    },
    /**切换表头 */
    changeTab: function (e) {
        console.log("切换表头", e);
        //重置数据
        load.resetConfig();
        this.requestAccountList(e.currentTarget.id);
    },
    //重置数据
    resetData: function () {
        load.resetConfig();
        this.data.storelist = null;
        this.data.currentPage = 1;
    },

    /** 获得账户列表 */
    requestAccountList: function (categoryId) {
        var that = this;
        var requestUrl = 'Consumer/get_accont_log';
        var tabType = '';
        if (categoryId == 0) {
            tabType = 'point';
        }
        else if (categoryId == 1) {
            tabType = 'money';
        }
        if (tabType) {
            requestUrl += '?type=' + tabType;
        }
        that.setData({ activeCategoryId: categoryId });
        request.get(requestUrl, {
            data: { type: tabType },
            success: function (res) {
                console.log("获得账户列表", res);
                if (res.data.status > 0 && res.data.done == 1) {
                    that.setData({
                        statac: 1,
                        acc_list: res.data.list
                    })
                } else {
                    that.setData({ statac: 2 })
                }
            }

        })
    }

});