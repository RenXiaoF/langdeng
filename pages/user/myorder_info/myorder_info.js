// pages/user/myorder_info/myorder_info.js
var app = getApp();
var request = app.request;
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_info: null,
    statac: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("我的订单详情",options);
    // 顶部标题的传入的索引
    var id = options.orderid;
    // 获取订单内容
    this.get_order_info(id);


  },

  get_order_info: function (id) {
    var that = this;
    var requestUrl = '/Checker/my_examine_order';
    request.get(requestUrl, {
      // data: { orderid: categoryId },
      data: { orderid: id },
      success: function (res) {
        if (res.data.status > 0 && res.data.done == 1) {
          that.setData({
            order_info: res.data.res,
            statac: 1
          })
        } else {
          that.setData({ statac: 2 })
        }
      }
    })
  }

})