// pages/user/my_collect/my_collect.js
var app = getApp();
var request = app.request;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.globalData.setting.url,
    resourceUrl: app.globalData.setting.resourceUrl,
    mycollectionlist: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 我的收藏
    this.get_my_collect();
  },

  /**我的收藏 */
  get_my_collect: function () {
    var that = this;
    var requestUrl = "Consumer/get_my_collect";
    request.get(requestUrl, {
      success: function (res) {
        console.log("我的收藏", res.data.list);
        if (res.data.status > 0 && res.data.done == 1) {
          that.setData({ mycollectionlist: res.data.list })
        }
      }
    })
  }


})