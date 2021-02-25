// index.js
var app = getApp();
var setting = app.globalData.setting;
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;

Page({
  data: {
        url: setting.url,
        menu:[
            {
                link:"/pages/goods/search/search",
                src:"../../../images/ico-team1.png",
                cont:"搜索"
            },
            {
                link: "/pages/activity/seckill_list/seckill_list",
                src: "../../../images/ico-team2.png",
                cont: "秒杀"
            },
            {
                link: "/pages/activity/group_list/group_list",
                src: "../../../images/ico-team3.png",
                cont: "团购"
            },
            {
                link: "/pages/goods/brandstreet/brandstreet",
                src: "../../../images/ico-team4.png",
                cont: "品牌街"
            },
            {
                link: "/pages/goods/integralMall/integralMall",
                src: "../../../images/ico-team5.png",
                cont: "积分商城"
            }
        ],
        goodlist: null,
        currentPage: 1,
    },

    onLoad: function (options) {
        load.init(this, '', 'goodlist');
        this.getFightGroupList();
    },

    getFightGroupList: function(){
        var that = this;
        var requestUrl = '/api/Team/AjaxTeamList?p=' + that.data.currentPage;
        load.request(requestUrl, function (res) {
            that.data.currentPage++;
            wx.stopPullDownRefresh();
        });
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.reloadGoodList();
    },

    //重置数据
    reloadGoodList: function () {
        load.resetConfig();
        this.data.goodlist = null;
        this.data.currentPage = 1;
        this.getFightGroupList();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (load.canloadMore()) {
            this.getFightGroupList();
        }
    },

})