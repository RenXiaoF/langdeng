// pages/user/quick_login/quick_login.js
var app = getApp();
var request = app.request;
var common = require('../../../utils/common.js');
var md5 = require('../../../utils/md5.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    typeAction: 'mobile', // 类型
    phone: '', // 手机号
    capacheUrl: '',
    tu_id: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**获得验证码 */
  getCode: function (e) {
    common.sendSmsCode(this.data.phone);
  },
  /**设置电话号码 */
  setMobile: function (e) {
    this.data.phone = e.detail.value;
  },

  /**提交表单 */
  submitRelate: function (values) {
    var that = this;
    // values.password = md5('TPSHOP' + values.password);
    console.log("登录", values);
    request.post('User/do_login', {
      data: {
        username: values.detail.value.username,
        code: values.detail.value.code,
        typeAction: that.data.typeAction
      },
      success: function (res) {
        console.log("登录", res);
        app.globalData.userInfo = res.data.result;
        app.globalData.userInfo.head_pic = common.getFullUrl(that.data.globalData.head_pic);
        app.showSuccess('登录成功', function () {
          that.goHome();
        });

      }
    });
  },
  /**跳转到首页 */
  goHome: function () {
    wx.switchTab({ url: '/pages/index/index/index' });
  },

})