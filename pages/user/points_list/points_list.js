var app = getApp();
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;
var util = require('../../../utils/util.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        categories: [
            { name: "全部", type: 'all' },
            { name: "赚取", type: 'plus' },
            { name: "消费", type: 'minus' }
        ],
        activeType: 'all',
        points: null,
        currentPage: 1
    },

    onLoad: function (options) {
        var type = typeof options.type == 'undefined' ? this.data.activeType : options.type;
        load.init(this, '', 'points');
        this.requestPointList(type);
    },

    changeTab: function (e) {
        //重置数据
        load.resetConfig();
        this.data.points = null;
        this.data.currentPage = 1;
        this.requestPointList(e.currentTarget.id);
    },

    requestPointList: function (type) {
        var that = this;
        var requestUrl = '/api/user/points_list/type/' + type + '?p=' + that.data.currentPage;
        this.setData({ activeType: type });
        load.request(requestUrl, function (res) {
            that.data.currentPage++;
            res.data.result.forEach(function (val, index, arr) {
                val.changeTimeFommat = util.format(val.change_time, 'yyyy-MM-dd hh:mm');
            });
            wx.stopPullDownRefresh();
        });
    },

    onReachBottom: function () {
        if (load.canloadMore()) {
            this.requestPointList(this.data.activeType);
        }
    },

    onPullDownRefresh: function (e) {
        this.data.points = null;
        this.data.currentPage = 1;
        load.resetConfig();
        this.requestPointList(this.data.activeType);
    }

});