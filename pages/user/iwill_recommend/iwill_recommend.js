// pages/user/iwill_recommend/iwill_recommend.js
var app = getApp();
var setting = app.globalData.setting;
var request = app.request;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    img: '',
    statac: 0,
    msg: '正在获取图片...'
    // objStatac:{
    //   statac: 0,
    //   msg: '正在获取图片...'
    // }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取二维码
    this.get_my_qrcode();
  },
  /**获取二维码 */
  get_my_qrcode: function () {
    var that = this;
    var requestUrl = "Consumer/getmyqr";
    request.get(requestUrl, {
      // data:{reload:true},
      success: function (res) {
        console.log("获取二维码", res.data);
        if (res.data.status > 0) {
          that.setData({
            statac: 1,
            img: res.data.img
          })
        } else {
          that.setData({ msg: '获取失败,请重新获取!' })
        }
      }
    })
  }

})