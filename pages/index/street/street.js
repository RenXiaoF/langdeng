var app = getApp();
var request = app.request;
var common = require('../../../utils/common.js');
var util = require('../../../utils/util.js');
import LoadMore from '../../../utils/LoadMore.js';
var load = new LoadMore;
import Regions from '../../../utils/regions/Regions.js';
var firstEnterPage = true;

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        stores: null,
        currentPage: 1,
        selectScId: 0,
        saleOrder: 0,
        address: {}, //地址信息
        activeNavId: -1,
        activeCategoryId: -1,
        showCategoryModal: false,
        longitude: 0, //经度
        latitude: 0, //纬度
        isGetLocation: false,
    },

    onLoad: function () {
        load.init(this, 'store_list', 'stores');
        this.initRegions();
    },

    onShow: function () {
        this.resetData();
        this.requrstStoresByGps();
    },

    onReachBottom: function () {
        if (load.canloadMore()) {
            this.requrstStoresByGps();
        }
    },

    /** 初始化区域弹框相关 */
    initRegions: function() {
        var that = this;
        new Regions(this, 'regions', {
            selectCall: function (e, parentId, regionName) {
                if (!parentId) {
                    that.setData({
                        activeCategoryId: -1,
                        activeNavId: e.currentTarget.dataset.i,
                    });
                }
            },
            endAreaLevel: 2,
            endAreaLevelCall: function (parentId, regionName, address) {
                that.data.address = address;
                that.data.selectScId = 0;
                that.data.saleOrder = 0;
                that.resetData();
                that.requrstStoresByGps();
            }
        });
    },

    /** 请求店铺数据 */
    requrstStores: function () {
        var that = this;
        var params = util.Obj2Str({
            p: that.data.currentPage,
            sc_id: that.data.selectScId,
            sale_order: that.data.saleOrder,
            province_id: (that.data.address.province ? that.data.address.province : 0),
            city_id: (that.data.address.city ? that.data.address.city : 0),
            lng: that.data.longitude,
            lat: that.data.latitude,
        });
        load.request('/api/index/store_street?' + params, function (res) {
            for (var i = 0; i < res.data.result.store_list.length; i++) {
                var s = res.data.result.store_list[i];
                s.descScoreDesc = common.getStoreScoreDecs(s.store_desccredit);
                s.serviceScoreDesc = common.getStoreScoreDecs(s.store_servicecredit);
                s.deliveryScoreDesc = common.getStoreScoreDecs(s.store_deliverycredit);
            }
            that.data.currentPage++;
            wx.stopPullDownRefresh();
        });
    },

    resetData: function () {
        this.data.stores = null;
        this.data.currentPage = 1;
        load.resetConfig();
    },

    onPullDownRefresh: function (e) {
        this.resetData();
        this.requrstStoresByGps();
    },

    changeTab:function(e) {
        var activeNavId = e.currentTarget.dataset.i;
        this.data.selectScId = 0;
        this.data.address = {};
        this.data.saleOrder = Number(!this.data.saleOrder);
        this.resetData();
        this.requrstStoresByGps();
        this.setData({ 
            activeCategoryId: -1,
            activeNavId: activeNavId,
        });
    },
    
    selectCategory: function (e) {
        this.data.selectScId = e.currentTarget.dataset.scid;
        this.data.saleOrder = 0;
        this.data.address = {};
        this.resetData();
        this.requrstStoresByGps();
        this.setData({
            activeCategoryId: e.currentTarget.dataset.i,
            showCategoryModal: false,
        });
    },

    openCategoryModal: function (e) {
        this.setData({
            activeNavId: e.currentTarget.dataset.i,
            showCategoryModal: true,
        });
    },

    closeCategoryModal: function () {
        this.setData({ showCategoryModal: false });
    },

    /** 关注店铺 */
    focusStore: function (e) {
        var that = this;
        var idx = e.currentTarget.dataset.idx;
        var store = that.data.stores.store_list[idx];
        request.post('/api/store/collectStoreOrNo', {
            data: { store_id: store.store_id },
            success: function () {
                if (!store.is_collect) {
                    app.showSuccess('关注成功');
                }
                var num = store.store_collect;
                store.is_collect = !store.is_collect;
                store.store_collect = store.is_collect ? (num + 1) : (num - 1);
                that.setData({ ['stores.store_list[' + idx + ']']: store });
            }
        });
    },

    /** 打开获取地理位置授权 */
    requrstStoresByGps(call) {
        var that = this;
        wx.getSetting({
            success: function (res) {
                if (res.authSetting["scope.userLocation"]) {
                    that.anthLocation();
                } else if (firstEnterPage) {
                    firstEnterPage = false;
                    wx.showModal({
                        title: '是否获取店家的距离？',
                        success: function (res) {
                            if (res.confirm) {
                                that.anthLocation();
                            } else {
                                that.requrstStores();
                            }
                        }
                    });
                } else {
                    that.requrstStores();
                }
            },
            fail: function () {
                that.requrstStores();
            }
        });
    },

    anthLocation: function() {
        var that = this;
        wx.authorize({
            scope: 'scope.userLocation',
            success: function () {
                that.getLocationData();
            },
            fail: function () {
                wx.openSetting({
                    success: function (res) {
                        if (res.authSetting["scope.userLocation"]) {
                            that.getLocationData();
                        }
                    }
                });
            }
        });
    },

    getLocationData: function() {
        var that = this;
        wx.getLocation({
            type: 'gcj02',
            success: function (res) {
                console.log('gps', res);
                that.data.latitude = res.latitude,
                that.data.longitude = res.longitude,
                that.setData({isGetLocation: true});
                that.requrstStores();
            }
        });
    },

});