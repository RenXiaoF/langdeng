// pages/user/my_pattern/my_pattern.js
var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var common = require('../../../utils/common.js');
import Regions from '../../../utils/regions/Regions.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    statac: 0,
    designer: [],
    userany: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 用户详情
    app.getUserInfo(function (userInfo) {
      that.setData({
        userany: userInfo,
      });
    });
    // 我的设计师
    this.get_my_designer();
  },

  /** 我的设计师 */
  get_my_designer: function () {
    var that = this;
    var requestUrl = "Consumer/my_designer";
    request.get(requestUrl, {
      success: function (res) {
        console.log("我的量体师", res.data.res);
        if (res.data.status > 0 && res.data.done == 1) {
          that.setData({
            designer: res.data.res,
            statac: 1
          })
        } else {
          that.setData({
            statac: 2
          })
        }
      }
    })
  },
  /** 一键复购 */
  one_step_appoint: function () {
    var that = this;
    var requestUrl = "Consumer/one_step_appoint";
    request.get(requestUrl, {
      data: {
        user_id: app.globalData.userInfo.user_id
      },
      success: function (res) {
        if (res.done == 3) {
          app.showSuccess(res.data.mas, function () {
            wx.navigateBack();
          }, 2000);
        } else if (res.done == 4) {
          app.showSuccess(res.data.mas, function () {
            wx.navigateBack();
          }, 1000);
        } else {
          app.showSuccess(res.data.mas, function () {
            wx.navigateBack();
          }, 2000);
        }
      }
    })
  },
  /**给设计师加油 */
  buildings:function(){
    wx.showModal({
      title: '感谢您',
      content: '非常感谢您的支持！！！',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**页面跳转 */
  jumpTo: function(){
    // if(!this.data.userany.mobile){
      wx.navigateTo({
        url: '/pages/user/quick_appointment/quick_appointment',
      });
    // }
  }


})