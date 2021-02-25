// pages/user/coin_list/coin_list.js
var app = getApp();
var request = app.request;
var common = require('../../../utils/common.js');
var util = require('../../../utils/util.js');
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.globalData.setting.url,
    resourceUrl: app.globalData.setting.resourceUrl,
    categories: [
      { name: "全部申请", id: 0 },
      { name: "待审核", id: 1 },
      { name: "已审核", id: 2 },
    ],
    activeCategoryId: 0,
    orderList: null, //请求的列表
    currentPage:1
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
    console.log(categoryId);
    var requestUrl = that.data.url + '/api/user/getCoinLists';
    var cointype='';
    if (categoryId == 0) {
      cointype = 'all';
    } else if (categoryId == 1) {
      cointype = 'wait';
    } else if (categoryId == 2) {
      cointype = 'finish';
    }

    requestUrl += '/cointype/' + cointype+'/p/' + that.data.currentPage;
    this.setData({ activeCategoryId: categoryId });
    load.request(requestUrl, function (res) {
      console.log("resssss");
      console.log(res);
      that.data.currentPage++;
      var data = res.data.result;
      for(var idx in data){
        data[idx].apply_time = util.formatTime(data[idx].apply_time,false);
        data[idx].work_time = util.formatTime(data[idx].work_time, false);
      }
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

  //删除积分申请
  delcoin: function(e){
    var id = e.currentTarget.id;
    console.log(id);
    var that = this;
    request.get(that.data.url + '/api/user/delCoinList', {
      data:{
        id:id
      },
      success: function (res) {
        app.showSuccess('删除成功！',function(){
          wx.startPullDownRefresh();
        })
      }
    })
  }
})