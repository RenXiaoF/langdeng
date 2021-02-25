// comment.js
var app = getApp();
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;
var util = require('../../../utils/util.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        categories: [
            { name: "全部评价", status: 2 },
            { name: "待评价", status: 0 },
            { name: "已评价", status: 1 }
        ],
        activeStatus: 0,
        comments: null,
        currentPage: 1
    },

    onLoad: function (options) {
        var status = typeof options.status == 'undefined' ? this.data.activeStatus : options.status;
        load.init(this, '', 'comments');
        this.requestComments(status);
    },

    onShow: function () {
        if (wx.getStorageSync('user:comment:update')) {
            wx.setStorageSync('user:comment:update', false);
            this.resetData();
            this.requestComments(this.data.activeStatus);
        }
    },

    changeTab: function (e) {
        this.resetData();
        this.requestComments(e.currentTarget.dataset.status);
    },

    requestComments: function (status) {
        var that = this;
        var requestUrl = that.data.url + '/api/user/comment/status/' + status + '?p=' + that.data.currentPage;
        this.setData({ activeStatus: status });
        load.request(requestUrl, function (res) {
            that.data.currentPage++;
            res.data.result.forEach(function (val, index, arr) {
                val.payTimeFommat = util.formatTime(val.pay_time);
            });
            wx.stopPullDownRefresh();
        });
    },

    onReachBottom: function () {
        if (load.canloadMore()) {
            this.requestComments(this.data.activeStatus);
        }
    },

    onPullDownRefresh: function (e) {
        this.resetData();
        this.requestComments(this.data.activeStatus);
    },

    /** 重置数据 */
    resetData: function () {
        this.data.comments = null;
        this.data.currentPage = 1;
        load.resetConfig();
    },

    /** 跳到评论页 */
    comment: function(e) {
        var comment = this.data.comments[e.currentTarget.dataset.idx];
        var params = util.Obj2Str({
            order_id: comment.order_id,
            goods_id: comment.goods_id,
            goods_name: comment.goods_name,
            spec_key_name: comment.spec_key_name,
            rec_id: comment.rec_id,
        });
        wx.navigateTo({ url: '/pages/user/add_comment/add_comment?' + params });
    }

});