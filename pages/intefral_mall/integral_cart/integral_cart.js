// pages/intefral_mall/integral_cart/integral_cart.js
var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var WxParse = require('../../../utils/wxParse/wxParse.js');
var common = require('../../../utils/common.js');
var arithmetic = require('../../../utils/accAdd.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: setting.url,
    resourceUrl: setting.resourceUrl,
    totalprice: '0', //总价
    num: 0, //商品总数
    ifmanage: false, //管理或结算
    ifall: false,
    carts: [], // 购物车商品列表
    checkAllToggle: false, // 是否全选标志
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // onLoad: function (options) {
  //   // 获取购物车列表
  //   this.getcartlist();
  // },

  /** 返回的时候刷新 */
  onShow: function () {
    this.getcartlist();
  },

  /**获取购物车列表 */
  getcartlist: function () {
    var that = this;
    let selectnum = 0;
    var requestUrl = "Cart/ajaxCartList";
    request.post(requestUrl, {
      success: function (res) {
        console.log(res);
        if (res.data.status == 1) {
          that.setData({
            carts: res.data.result.storeList,
          })
          that.data.carts.map(v => {
            selectnum += v.select_all;
          });
          if (selectnum == that.data.carts.length) {
            that.setData({ ifall: true })
          }
        }
      }
    })
  },

  /** 删除一单个商品 */
  deleteItem: function (e) {
    var that = this;
    let ids = [];
    that.data.carts.map(val => {
      val.cartList.map(cval => {
        if (cval.selected) {
          ids.push(cval.id);
        }
      })
    })
    request.post('Cart/ajaxDelCart', {
      data: { 'ids': ids },
      success: function (res) {
        if (res.data.status == 1) {
          that.getcartlist();
        }
      },
      error: function (err) {
        console.log("删除单个商品", err);
      }
    });
  },

  /** 提交购物车数据 */
  postCardList: function (postData) {
    var that = this;
    request.post('Cart/modifyCartGoods', {
      data: { cart_id: postData },
      success: function (res) {
        // TODO: something
      }
    });
  },

  /** 输入购买数量 */
  valueToNum: function (e) {
    console.log("输入购买数量", e);
    var sidx = e.currentTarget.dataset.sidx;
    var cart = this.data.carts[sidx];
    var cart_select = {};
    cart_select[cart['id']] = cart.value;
    var goods_num = {};
    var num = (e.detail.value <= 1) ? 1 : (e.detail.value);
    goods_num[cart['id']] = num;

    var postData = JSON.stringify({ 'cart_select': cart_select, 'goods_num': goods_num });
    this.postCardList(postData);
  },

  /** 数量加1 */
  addNum: function (e) {
    console.log("数量加1", e);
    var that = this;
    // var sidx = e.currentTarget.dataset.sidx;
    // var cart = this.data.carts[sidx];
    // var cart_select = {};
    // cart_select[cart['id']] = cart.value;
    // var goods_num = {};
    // var num = 1 + cart.goods_num;
    // goods_num[cart['id']] = num;

    // var postData = JSON.stringify({ 'cart_select': cart_select, 'goods_num': goods_num });
    // this.postCardList(postData);
    that.data.carts.map(val => {
      val.cartList.map(cval => {
        if (cval.id == cart_id) {
          if (arithmetic.accAdd(cval.goods_num, 1) < 1) {
            wx.showToast({
              title: '不能小于1',
              icon: 'none',
              duration: 1500,
              mask: false,
            });
          } else {
            cval.goods_num = arithmetic.accAdd(cval.goods_num, 1);
          }
        }
      })
    })
  },

  /** 数量减1 */
  subNum: function (e) {
    console.log("数量减1", e);
    var sidx = e.currentTarget.dataset.sidx;
    var cart = this.data.carts[sidx];
    var cart_select = {};
    cart_select[cart['id']] = cart.value;
    var goods_num = {};
    var num = (cart.goods_num <= 1) ? 1 : (cart.goods_num - 1);
    goods_num[cart['id']] = num;

    var postData = JSON.stringify({ 'cart_select': cart_select, 'goods_num': goods_num });
    this.postCardList(postData);
  },

  /** 选择所有商品 */
  selectAll: function () {
    this.data.checkAllToggle = !this.data.checkAllToggle;
    var carts = this.data.carts;
    var carts_num = carts.length;
    var cart_select = {};
    var goods_num = {};
    for (var i = 0; i < carts_num; i++) {
      cart_select[carts[i].id] = this.data.checkAllToggle;
      goods_num[carts[i].id] = carts[i].goods_num;
    }
    var postData = JSON.stringify({ 'cart_select': cart_select, 'goods_num': goods_num });
    this.postCardList(postData);
  },

  /** 选择单一商品 已选/未选 */
  selectGoods: function (e) {
    console.log("选择单个商品", e);
    var that = this;
    var requestUrl = 'Cart/modifyCartGoodsStatus';
    // 获取cart_id
    var sidx = e.currentTarget.dataset.sidx;
    var cart = that.data.carts[sidx];
    // 选中的cart_select
    var cart_select = {};
    request.post(requestUrl, {
      data: {
        'op_type': 0,
        'cart_id': sidx,
        'cart_select': cart_select[cart['id']] = cart.value ? 0 : 1,
      },
      success: function (res) {
        if (res.data.status == 1) {
          let storeselect = 0; //已选店铺数量
          that.data.carts.map(val => {
            let cartselect = 0;//单个店铺被选商品数量
            val.cartList.map(cval => {
              if (cval.selected) {
                cartselect++;
              }
            })
            if (val.cartList.length == cartselect) {
              val.select_all = true;//单个店铺被选
              storeselect++;
            } else {
              val.select_all = false; //单个店铺没被选
            }
          });
          // 全选
          if (that.data.carts.length == storeselect) {
            that.data.ifall = true;
          } else {
            that.data.ifall = false;
          }
          that.calcuprice();
        } else {
          console.log("选择单个商品", res.data.msg);
        }
      },
      error: function (err) {
        console.log("选择单个商品error", err);
      }
    })
  },

  /**计算总价和总数量 */
  calcuprice: function () {
    let total = 0; // 总价
    let num = 0; // 总数量
    that.data.storelist.forEach(val => {
      val.cartList.forEach(cval => {
        if (cval.selected) {

        }
      })
    })
  },

  /** 去结算 */
  checkout: function () {
    var hasAnySelected = false;
    var carts = this.data.carts;
    for (var i = 0; i < carts.length; i++) {
      if (carts[i].selected) {
        hasAnySelected = true;
        break;
      }
    }
    if (!hasAnySelected) {
      app.showWarning('还没有选中商品');
      return;
    }
    wx.navigateTo({ url: '/pages/intefral_mall/fillorder/fillorder' });
  },

  /**临时跳转使用 */
  gotofillorder: function () {
    wx.navigateTo({
      url: '/pages/intefral_mall/fillorder/fillorder',

    });

  }


})