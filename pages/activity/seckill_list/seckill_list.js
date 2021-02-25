// seckill_list.js
var app = getApp();
var request = app.request;
var setting = app.globalData.setting;
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;

Page({
    data: {
        url: setting.url,
        killtime: null,
        currentPage: 1,
        timeac: 0,
        goodlist: null,
    },

    changeTimeAc:function(e){
        this.setData({ timeac: e.currentTarget.dataset.index });
        this.reloadGoodList();
    },

    onLoad: function (options) {
        load.init(this, '', 'goodlist');
        this.requestTime();
    },

    requestTime: function(){
        var that = this;
        request.post('/api/activity/flash_sale_time',{
            success: function(res){
                var time = res.data.result.time;
                that.setData({ killtime: time });
                that.requestSalelist(that.data.killtime[that.data.timeac]);
            }
        });
    },

    requestSalelist: function (time){
        var that = this;
        var requestUrl = '/api/activity/flash_sale_list?p=' + that.data.currentPage + '&start_time=' + time.start_time + '&end_time=' + time.end_time;
        load.request(requestUrl, function (res) {
            that.data.currentPage++;
            wx.stopPullDownRefresh();
        });
    },
 
    onPullDownRefresh: function () {
        this.reloadGoodList();
    },

    //重置数据
    reloadGoodList: function () {
        load.resetConfig();
        this.data.goodlist = null;
        this.data.currentPage = 1;
        this.requestSalelist(this.data.killtime[this.data.timeac]);
    },
  
    onReachBottom: function () {
        if (load.canloadMore()) {
            this.requestSalelist(this.data.killtime[this.data.timeac]);
        }
    },

})