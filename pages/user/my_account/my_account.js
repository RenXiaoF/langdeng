// pages/user/my_account/my_account.js
var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.globalData.setting.url,
    resourceUrl: app.globalData.setting.resourceUrl,
    userMoney: 0,
    unuserMoney: 0,
  },

  onShow: function () {
    var that = this;
    app.getUserInfo(function (userInfo) {
      that.setData({
        userMoney: userInfo.user_money,
        unuserMoney: userInfo.un_user_money,
      });
    });
    console.log('thisroute');
    console.log(this.route);
    console.log(this);
  },
})