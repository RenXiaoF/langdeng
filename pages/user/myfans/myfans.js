// pages/user/myfans/myfans.js
var app = getApp();
var request = app.request;
var common = require('../../../utils/common.js');
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.globalData.setting.url,
    resourceUrl: app.globalData.setting.resourceUrl,
    categories:[
      {id:0,name:'全部粉丝'},
      {id:1,name:'一级粉丝'},
      {id:2,name:'二级粉丝'}
    ],
    //当前
    typeId: 0,
    fanslists:null,
    // fanslists: [
    //   { img: '../../../images/pic-member1.png', name: '11111', num: '11111' },
    //   { img: '../../../images/pic-member1.png', name: '22222', num: '22222' },
    // ],
    currentPage: 1
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = typeof options.typeId == 'undefined' ? this.data.typeId : options.typeId;
    load.init(this, '', 'fanslists');
    this.setData({typeId : id});
    this.requestFans(id);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.reloadFans(this.data.typeId);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (load.canloadMore()) {
      this.reloadFans(this.data.typeId);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  onShow: function () {
    if (wx.getStorageSync('order:order_list:update')) {
      wx.setStorageSync('order:order_list:update', false);
      this.resetData();
      this.requestFans(this.data.typeId);
    }
  },

  changeTab: function (e) {
    this.resetData();
    this.reloadFans(e.currentTarget.id);
  },

  //重载数据
  reloadFans: function (typeId) {
    load.resetConfig();
    this.setData({ fanslists: null });
    this.data.currentPage = 1;
    this.requestFans(typeId);
  },

  //重置数据
  resetData: function () {
    load.resetConfig();
    this.data.fanslists = null;
    this.data.currentPage = 1;
  },

  requestFans: function (typeId) {
    var that = this;
    this.setData({typeId:typeId});
    var requestUrl = that.data.url + '/api/user/getFanslists'+'/typeId/'+typeId+'/p/'+that.data.currentPage;
    load.request(requestUrl, function (res) {
      that.data.currentPage++;
      wx.stopPullDownRefresh();
    });
  }

  // requestFans: function (typeId) {
  //   var that = this;
  //   this.setData({ typeId: typeId });
  //   request.post('/api/user/getFanslists',{
  //     data: {
  //       fanstype:typeId
  //     },
  //     success: function(res){
  //       this.data.fanslists=res.data.result;
  //       console.log("6666666");
  //       console.log(this.data.fanslists);
  //       console.log(res);
  //     }
  //   })
  // }

})