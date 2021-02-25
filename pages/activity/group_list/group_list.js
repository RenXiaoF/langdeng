var app = getApp();
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;
var util = require('../../../utils/util.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        requestData: null,
        tabType: '',
        goodsCurrentPage: 1,
        timer: null,
    },

    onLoad: function () {
        load.init(this, 'groups', 'requestData');
        this.requestGroupBuy();
        this.createTimer();
    },

    onUnload: function() {
        clearInterval(this.data.timer);
    },

    changeTab: function (event) {
        var tabType = '';
        if (event.target.id == 'tab_new') {
            tabType = 'new';
        } else if (event.target.id == 'tab_comment') {
            tabType = 'comment';
        }
        this.setData({ tabType: tabType });
        this.reloadGoodList();
    },

    requestGroupBuy: function () {
        var that = this;
        var requestUrl = that.data.url + '/api/activity/group_list/type/' + this.data.tabType;
        requestUrl = requestUrl + '?p=' + that.data.goodsCurrentPage;
        load.request(requestUrl, function () {
            that.data.goodsCurrentPage++;
            wx.stopPullDownRefresh();
        });
    },

    onPullDownRefresh: function () {
        this.reloadGoodList();
    },

    //重置数据
    reloadGoodList: function () {
        load.resetConfig();
        this.data.requestData = null;
        this.data.goodsCurrentPage = 1;
        this.requestGroupBuy();
        clearInterval(this.data.timer);
        this.createTimer();
    },

    onReachBottom: function () {
        if (load.canloadMore()) {
            this.requestGroupBuy();
        }
    },

    createTimer: function () {
        var that = this;
        var startTime = (new Date()).getTime();
        this.data.timer = setInterval(function () {
            if (!that.data.requestData || !that.data.requestData.groups) {
                return;
            }
            var remainTime = 0;
            var groups = that.data.requestData.groups;
            for (var i = 0; i < groups.length; i++) {
                var diffTime = startTime - groups[0].server_time * 1000;
                groups[i].remainTime = util.remainTime(groups[i].end_time * 1000 - (new Date()).getTime() + diffTime);
            }
            that.setData({ 'requestData.groups': groups });
        }, 1000);
    },

});