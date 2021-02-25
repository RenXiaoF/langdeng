// team_detail.js
var app = getApp();
var request = app.request;
var setting = app.globalData.setting;
var util = require('../../../utils/util.js');
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;

Page({
    data: {
        url: setting.url,
        openSpecModal: false, //是否打开规格弹窗
        foundId: 0, 
        team: null,
        teamFollow: null,
        teamFound: null,
        serverTime: 0,
        teamGoods: null,
        teamMsg: {
            msg: '',
            btnTxt: '',
        },
        timer: null,
        goodsInputNum: 1,
        currentPage: 1,
    },

    onLoad: function (options) {
        load.init(this, '', 'teamGoods');
        var foundId = typeof options.foundId == 'undefined' ? 0 : options.foundId;
        this.setData({ foundId: foundId });
        this.getTeamGoods();
        this.getTeamGoodlist();
    },

    getTeamGoods: function(){
        var that = this;
        request.get('/api/Team/found', {
            data: {
                id: that.data.foundId,
            },
            failRollback: true,
            success: function (res) {
                var result = res.data.result;
                that.setData({
                    serverTime: result.server_time,
                    team: result.team,
                    teamFollow: result.teamFollow,
                    teamFound: result.teamFound,
                });
                if (result.teamFound.status == 0){
                    that.setData({ 
                        'teamMsg.msg': "待开团",
                        'teamMsg.btnTxt': "一键发起拼单",
                    });
                } else if (result.teamFound.status == 1){
                    that.setData({
                        'teamMsg.msg': '',
                        'teamMsg.btnTxt': "一键参团",
                    });
                    that.createTimer();
                } else if (result.teamFound.status == 2) {
                    that.setData({
                        'teamMsg.msg': "拼单已满",
                        'teamMsg.btnTxt': "一键发起拼单",
                    });
                } else {
                    that.setData({
                        'teamMsg.msg': "拼单失败",
                        'teamMsg.btnTxt': "一键发起拼单",
                    });
                }
            }
        });
    },

    createTimer: function () {
        var that = this;
        var startTime = (new Date()).getTime();
        this.data.timer = setInterval(function () {
            var teamFound = that.data.teamFound;
            var diffTime = startTime - that.data.serverTime * 1000;
            teamFound.remainTime = util.transTime(teamFound.found_end_time * 1000 - (new Date()).getTime() + diffTime);
            if (teamFound.remainTime.hour <= 0 && teamFound.remainTime.minute <= 0 && teamFound.remainTime.second <= 0){
                clearInterval(that.data.timer);
                that.getTeamGoods();
            }
            that.setData({ teamFound: teamFound });
        }, 1000);
    },

    onUnload: function () {
        clearInterval(this.data.timer);
    },

    getTeamGoodlist: function(){
        var that = this;
        var requestUrl = '/api/Team/ajaxGetMore?p=' + that.data.currentPage;
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
        this.data.teamGoods = null;
        this.data.currentPage = 1;
        this.getTeamGoodlist();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        if (load.canloadMore()) {
            this.getTeamGoodlist();
        }
    },

    /** 关闭规格弹窗 */
    closeSpecModal: function () {
        this.setData({ openSpecModal: false });
    },

    /** 打开规格弹窗 */
    openSpecModel: function () {
        this.setData({ openSpecModal: true });
    },

    /** 增加购买的商品数量 */
    addCartNum: function (e) {
        var num = this.data.goodsInputNum + 1;
        this.setData({ goodsInputNum: num});
    },

    /** 减少购买的商品数量 */
    subCartNum: function (e) {
        var num = this.data.goodsInputNum - 1;
        if(num < 1){
            num = 1;
        }
        this.setData({ goodsInputNum: num });
    },

    /** 输入购买的数量 */
    inputCartNum: function (e) {
        var num = Number(e.detail.value);
        this.setData({ goodsInputNum: num });
    },

    /** 立即购买 */
    buyNow: function(){
        var that = this;
        var data={
            team_id: that.data.team.team_id,
            goods_num: that.data.goodsInputNum,
            found_id: that.data.teamFound.status == 1 ? that.data.foundId : '',
        };
        request.get('/api/Team/addOrder', {
            data: data,
            success: function (res) {
                var result = res.data.result;
                wx.navigateTo({ url: '/pages/team/team_confirm/team_confirm?orderSn=' + res.data.result.order_sn });
            }
        });
    },

})
