// pages/intefral_mall/check_address/check_address.js
var app = getApp();
var request = app.request;
var common = require('../../../utils/common.js');
var util = require('../../../utils/util.js');
var md5 = require('../../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.globalData.setting.url,
    resourceUrl: app.globalData.setting.resourceUrl,
    addresslist: [], // 地址列表
    ifchooseaddress: false, // 如果选择地址
    ifdisabled: false, // 如果禁用
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取地址列表
    this.getaddresslist();
  },

  /**获取地址列表 */
  getaddresslist: function () {
    var that = this;
    var requestUrl = 'Cart/ajaxAddress';
    request.post(requestUrl, {
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({ addresslist: res.data.result.address_list })
        }
      }
    })
  },

  /**删除地址 */
  del_address: function () {
    var that = this;
    var addressId = this.data.addresslist.address_id;
    var requestUrl = 'Cart/del_address';

    if (!addressId) {
      return;
    }
    wx.showModal({
      title: '确定删除？',
      success: function (res) {
        res.confirm && request.post(requestUrl, {
          data: { id: addressId },
          success: function (res) {
            app.showSuccess('删除成功', function () {
              wx.navigateBack();
            }, 500);
          }
        });
      }
    })
  },




  /**跳转到添加地址页 */
  goToAddAddress: function () {
    wx.navigateTo({
      url: '/pages/intefral_mall/add_address/add_address',

    });

  }


})