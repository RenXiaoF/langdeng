var app = getApp();
var request = app.request;
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        goodsCollects: null, //请求的商品收藏
        storeCollects: null, //请求的店铺收藏
        currentPage: 1,
        activeFollow:1
    },

    onLoad: function () {
        load.init(this, '', 'goodsCollects');
        this.requestCollectGoods();
    },

    requestCollectGoods: function () {
        var that = this;
        var requestUrl = '/api/user/getGoodsCollect' + '?p=' + that.data.currentPage;
        load.request(requestUrl, function (res) {
            that.data.currentPage++;
        });
    },

    requestCollectStore: function () {
        var that = this;
        var requestUrl = '/api/user/getUserCollectStore' + '?page=' + that.data.currentPage;
        load.request(requestUrl, function (res) {
            that.data.currentPage++;
        });
    },

    onReachBottom: function () {
        if (load.canloadMore()) {
            if (this.data.activeFollow == 1) {
                this.requestCollectGoods();
            } else {
                this.requestCollectStore();
            }
        }
    },

    /** 取消商品收藏 */
    cancelCollectGoods: function (e) {
        var goodsId = e.currentTarget.dataset.id;
        var that = this;
        request.post('/api/goods/collectGoodsOrNo', {
            data: { goods_id: goodsId },
            success: function (res) {
                that.deleteGoodsData(goodsId);
            }
        });
    },

    /** 删除单项商品数据 */
    deleteGoodsData: function (goodsId) {
        for (var i = 0; i < this.data.goodsCollects.length; i++) {
            if (this.data.goodsCollects[i].goods_id == goodsId) {
                this.data.goodsCollects.splice(i, 1);
                this.setData({ goodsCollects: this.data.goodsCollects });
                break;
            }
        }
    },

    /** 取消店铺收藏 */
    cancelCollectStore: function (e) {
        var storeId = e.currentTarget.dataset.id;
        var that = this;
        request.post('/api/store/collectStoreOrNo', {
            data: { store_id: storeId },
            success: function (res) {
                that.deleteStoreData(storeId);
            }
        });
    },

    /** 删除单项店铺数据 */
    deleteStoreData: function (storeId) {
        for (var i = 0; i < this.data.storeCollects.length; i++) {
            if (this.data.storeCollects[i].store_id == storeId) {
                this.data.storeCollects.splice(i, 1);
                this.setData({ storeCollects: this.data.storeCollects });
                break;
            }
        }
    },

    checkNav:function(e) {
        this.setData({ activeFollow: e.currentTarget.dataset.i });
        this.data.currentPage = 1;
        this.data.goodsCollects = null;
        this.data.storeCollects = null;
        if (this.data.activeFollow == 1) {
            load.init(this, '', 'goodsCollects');
            this.requestCollectGoods();
        } else {
            load.init(this, '', 'storeCollects');
            this.requestCollectStore();
        }
    }

});