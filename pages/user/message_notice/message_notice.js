// message_notice.js
var app = getApp();
var request = app.request;
var util = require('../../../utils/util.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        categories: [
            { name: "全部消息", status: 0 },
            { name: "系统消息", status: 1 },
            { name: "活动消息", status: 2 }
        ],
        activeStatus: 0,
        messages: null,
    },

    onLoad: function (options) {
        var status = typeof options.status == 'undefined' ? this.data.activeStatus : options.status;
        this.requestMessages(status);
    },

    changeTab: function (e) {
        this.requestMessages(e.currentTarget.dataset.status);
    },

    requestMessages: function (status) {
        var that = this;
        //待完善，后台也还没有分页
        this.setData({ activeStatus: status });
        request.get('/api/user/message_list?type=' + status, {
            success: function (res) {
                res.data.result.forEach(function (val, index, arr) {
                    val.sendTimeFommat = util.format(val.send_time, 'yyyy-MM-dd');
                });
                that.setData({ messages: res.data.result });
                wx.stopPullDownRefresh();
            }
        });
    },

    onPullDownRefresh: function (e) {
        this.resetData();
        this.requestMessages(this.data.activeStatus);
    },

});