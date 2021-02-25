// pages/user/exchange_coin/exchange_coin.js
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
    user:[],
    exchange_coin_rate:'',
    bcoin:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("666");
    this.getinfo();
  },

  getinfo: function (){
    var that=this;
    request.get(that.data.url +'/api/user/exchange_coin',{
      success: function(res){
        console.log('res');
        console.log(res);
        that.setData({ exchange_coin_rate:res.data.result.exchange_coin_rate});
        that.setData({user:res.data.result.user});
        console.log(that.data.exchange_coin_rate);
      }
    })
  },
  changea: function (e){
    var acoin = e.detail.value;
    var rate = this.data.exchange_coin_rate;
    var bcoin = acoin*rate;
    this.setData({bcoin:bcoin});
  },

  formSubmit: function (e) {
    var user_money = e.detail.value.user_money;
    var that = this;

    var reg = /^[-\+]?\d+(\.\d+)?$/;
    if (!reg.test(user_money)) {
      app.showWarning('积分数量为整数！');
      return;
    }

    if(user_money<=0){
      app.showWarning('输入积分大于0！',{
        
      })
    }else{
      request.get(that.data.url + '/api/user/exchange_coin_submit', {
        data: {
          user_money: user_money
        },
        success: function (res) {
          console.log('res');
          console.log(res);
          if (res.data.status == 0) {
            app.showWarning(res.data.msg, function () {

            });
          } else {
            app.showWarning(res.data.msg, function () {
              wx.navigateBack();
            });
          }
        }
      })
    }
    
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})