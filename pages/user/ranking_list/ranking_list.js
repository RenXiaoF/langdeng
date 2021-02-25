// pages/user/ranking_list/ranking_list.js
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
    list:[],
    currentPage:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options');
    console.log(options);
    this.getList();
  },

  getList: function(){
    var that = this;
    request.get(that.data.url +'/api/user/ranking_list/p'+that.data.currentPage,{
      success:function(res){
        that.data.currentPage++;
        console.log('res');
        console.log(res);
        that.setData({list:res.data.result.list})
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getList();
  },
})