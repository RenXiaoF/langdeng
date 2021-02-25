var app = getApp();
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        requestData: null,
        rankType: '',
        goodsCurrentPage: 1
    },

    onLoad: function () {
        load.init(this, 'goods_list', 'requestData');
        this.requestIntegralMall();
    },

    changeTab: function(event) {
        var rank = '';
        if (event.target.id == 'rank_num') {
            rank = 'num';
        } else if (event.target.id == 'rank_integral') {
            rank = 'integral';
        }
        this.setData({ rankType: rank });
        this.reloadGoodList();
    },

    requestIntegralMall: function() {
        var that = this;
        var requestUrl = '/api/goods/integralMall/rank/' + this.data.rankType;
        requestUrl = requestUrl + '?p=' + that.data.goodsCurrentPage;
        load.request(requestUrl, function(res) {
            that.data.goodsCurrentPage++;
            res.data.result.goods_list.forEach(function(val) {
                val.calPoint = (val.shop_price - val.exchange_integral / res.data.result.point_rate).toFixed(2);
            });
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
        this.requestIntegralMall();
    },

    onReachBottom: function() {
        if (load.canloadMore()) {
            this.requestIntegralMall(this.data.rankType);
        }
    },

});