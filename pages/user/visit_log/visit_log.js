var app = getApp();
var request = app.request;
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        visits: null,
        currentPage: 1
    },

    onLoad: function () {
        var that = this;
        load.init(this, '', 'visits');
        this.requestVisitLog();
    },

    onShow: function () {
        this.resetData();
        this.requestVisitLog();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.resetData();
        this.requestVisitLog();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (load.canloadMore()) {
            this.requestVisitLog();
        }
    },

    requestVisitLog: function () {
        var that = this;
        var requestUrl = that.data.url + '/api/user/visit_log?p=' + that.data.currentPage;
        load.request(requestUrl, function (res) {
            that.data.currentPage++;
            wx.stopPullDownRefresh();
        });
    },

    resetData: function () {
        this.data.currentPage = 1;
        this.data.visits = null;
        load.resetConfig();
    },

    deleteVisit: function (e) {
        var that = this;
        var vidx = e.currentTarget.dataset.vidx;
        var gidx = e.currentTarget.dataset.gidx;
        console.log(e.currentTarget.dataset);
        var visits = that.data.visits;
        request.post('/api/user/del_visit_log', {
            data: { visit_ids: visits[vidx].visit[gidx].visit_id },
            success: function (res) {
                if (visits[vidx].visit.length == 1) {
                    visits.splice(vidx, 1);
                } else {
                    visits[vidx].visit.splice(gidx, 1);
                }
                that.setData({ visits: visits });
            }
        });
    }

})