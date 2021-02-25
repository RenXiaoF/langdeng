// pages/intefral_mall/fillorder/fillorder.js
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
    //地址
    address: {
      // address_id: '',
    },
    user_note: '',
    storelist: [], // 商品列表
    total_price: {
      // postfee: 0,//邮费
      // goodsfee: 0,//总商品总额
      // user_points: 0,
      // payables: 0//总金额
    },
    submitdata: {
      act: '',
      address_id: '',
      shipping_code: [],
      user_note: '',
    },
    //更新配送方式时所有店铺的配送方式
    shipping_code: {},
    shipping: null,
    shipping_index: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 填写表单
    this.getcart2();

  },

  /**填写表单 */
  getcart2: function () {
    var that = this;
    var requestUrl = 'Cart/cart2';
    request.post(requestUrl, {
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            address: res.data.result.address,
            storelist: res.data.result.storeList,
            total_price: res.data.result.total_price,
            // 'total_price.goodsfee': res.data.result.total_price.total_fee,
            // 'total_price.payables': res.data.result.total_price.total_fee,
            // 'total_price.user_points': res.data.result.total_price.user_points,
          });
          that.storelist.map(val => {
            // 选择快递
            request.post('Cart/getStoreShipping', {
              data: { 'store_id': val.store_id },
              success: function (res) {
                if (res.data.status == 1) {
                  val.postarr = res.data.result,
                    val.choosepostname = ''
                    // val.choosepostname = that.data.shipping
                    that.setData({shipping: res.data.result})
                }
              }
            })
            that.shipping_code[val.store_id] = '';
          });
        }
        // 去到登陆页
        else if (res.data.status == -99) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3000,
            mask: false,
          });
          wx.navigateTo({
            url: '/pages/user/relation_login/relation_login',
          });
        }
        // 去到地址选择也
        else if (res.data.status == -10) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3000,
            mask: false,
          });
          wx.navigateTo({
            url: '/pages/intefral_mall/check_address/check_address',
          });
        }
        else if (res.data.status == -101) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3000,
            mask: false,
          });
        }
        else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3000,
            mask: false,
          });
        }
      }
    })
  },

  /**跳到选择地址也 */
  gotoaddress: function () {
    wx.navigateTo({
      url: '/pages/intefral_mall/check_address/check_address',
    });
  },

  /**更新price */
  updateprice: function () {
    var that = this;
    var requestUrl = 'Cart/cart3';
    let address_id = that.data.address.address_id;
    let shipping_code = JSON.stringify(that.data.shipping_code);
    request.post(requestUrl, {
      data: {
        'address_id': address_id,
        'shipping_code': shipping_code
      },
      success: function (res) {
        if (res.data.status == 1) {
          that.setData({
            'total_price.postfee': res.data.result.postFee,
            'total_price.goodsfee': res.data.result.goodsFee,
            'total_price.user_points': res.data.result.user_points,
            'total_price.payables': res.data.result.payables,
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3000,
            mask: false,
          });
        }
      },
      error: function (err) {
        console.log(err);
      }
    })
  },

  /**选择送货地址 */
  selectShipping: function (e) {
    this.setData({ 'shipping_index': e.detail.value })
  },

  /** 提交订单 */
  submit: function () {
    var that = this;
    var requestUrl = '/Cart/cart3';
    request.post(requestUrl, {
      data: {
        'act': 'submit_order',
        'address_id': that.data.address.address_id,
        'shipping_code': that.data.shipping_code,
        'user_note': that.data.user_note
      },
      success: function (res) {
        if (res.data.status == 1) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1500,
            mask: false,
          });
          wx.navigateTo({
            url: '/pages/user/point_redemption/point_redemption',
          });
        }
        // 去到登陆页
        else if (res.data.status == -99) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3000,
            mask: false,
          });
          wx.navigateTo({
            url: '/pages/user/relation_login/relation_login',
          });
        }
        else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 3000,
            mask: false,
          });
        }
      }
    })
  }


})