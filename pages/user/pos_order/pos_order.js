var app = getApp();
var request = app.request;
var common = require('../../../utils/common.js');
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;

Page({
  data: {
    url: app.globalData.setting.url,
    resourceUrl: app.globalData.setting.resourceUrl,
    categories: [
      { name: "全部零售单", id: 0 },
      { name: "销售单", id: 1 },
      { name: "退货单", id: 2 },
    ],
    activeCategoryId: 0, 
    orderList: null, //请求的订单列表
    currentPage: 1
    // orderList:[
    //   { 
    //     name: 'jyj', 
    //     order_goods:[
    //       {goods_num:1,goods_name:1},
    //       { goods_num: 1, goods_name: 1 },
    //       { goods_num: 1, goods_name: 1 },
    //     ]
    //   },
    //   {
    //     name: 'jyj2',
    //     order_goods: [
    //       { goods_num: 1, goods_name: 1 },
    //       { goods_num: 1, goods_name: 1 },
    //       { goods_num: 1, goods_name: 1 },
    //     ]
    //   }
    // ],
    
  },

  onLoad: function (options) {
    var id = typeof options.type == 'undefined' ? this.data.activeCategoryId : options.type;
    load.init(this, '', 'orderList');
    this.requestOrderList(id);
    wx.removeStorageSync('order:order_list:update');
  },

  onShow: function () {
    if (wx.getStorageSync('order:order_list:update')) {
      wx.setStorageSync('order:order_list:update', false);
      this.resetData();
      this.requestOrderList(this.data.activeCategoryId);
    }
  },

  changeTab: function (e) {
    this.resetData();
    this.requestOrderList(e.currentTarget.id);
  },

  //重置数据
  resetData: function () {
    load.resetConfig();
    this.data.orderList = null;
    this.data.currentPage = 1;
  },

  /** 请求订单数据 */
  requestOrderList: function (categoryId) {
    var that = this;
    var requestUrl = that.data.url + '/api/user/getPosOrderList/p/'+that.data.currentPage;
    if (categoryId) {
      requestUrl += '/postype/' + categoryId;
    }
    this.setData({ activeCategoryId: categoryId });
    load.request(requestUrl, function (res) {
      that.data.currentPage++;
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom: function () {
    if (load.canloadMore()) {
      this.requestOrderList(this.data.activeCategoryId);
    }
  },
  onPullDownRefresh: function (e) {
    this.resetData();
    this.requestOrderList(this.data.activeCategoryId);
  },

});