// pages/user/signup/signup.js
var app = getApp();
var request = app.request;
var setting = require('../../../setting.js');
var common = require('../../../utils/common.js');
var md5 = require('../../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.globalData.setting.url,
    resourceUrl: app.globalData.setting.resourceUrl,
    // 账户
    account: {
      mobile: '',
      password: '',
    },

    typeAction: 'mobile', // 类型
    phone: '', // 手机号
    capacheUrl: '',
    tu_id: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.tu_id = options.tu_id;
  },

  /**获得验证码 */
  getCode: function (e) {
    common.sendSmsCode(this.data.phone);
  },
  /**设置电话号码 */
  setMobile: function (e) {
    this.data.phone = e.detail.value;
  },

  /**提交手机和code */
  submitRelate: function (values) {
    var that = this;
    // values.password = md5('TPSHOP' + values.password);
    console.log("登录", values);
    request.post('User/do_login', {
      data: {
        mobile: values.detail.value.mobile,
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

  /**绑定 */
  doSignup: function (e) {
    var that = this;
    var values = e.detail.value;
    var requestUrl = 'user/wechat_register';
    if (values.password == '' || values.confirm_password == '' || values.mobile == '' || values.code == '') {
        return app.showWarning("请先填写完表单信息");
    }
    if (values.password != values.confirm_password) {
        return app.showWarning("新密码两次输入不一致");
    }
    values.tu_id = this.data.tu_id;
    values.password = md5('TPSHOP' + values.password);

    request.post(requestUrl, {
      data: values,
      success: function (res) {
        app.globalData.userInfo = res.data.result;
        app.showSuccess('绑定成功', function () {
          that.goHome();
        });

      }
    })
  },
  /**跳转到首页 */
  goHome: function () {
    wx.switchTab({ url: '/pages/index/index/index' });
  },


})