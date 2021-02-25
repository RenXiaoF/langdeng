// pages/intefral_mall/intefral_mall/intefral_mall.js
var app = getApp();
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;
var request = app.request;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.globalData.setting.url,
    resourceUrl: app.globalData.setting.resourceUrl,

    cate_list: [],
    goods_list: [],
    myInput: '',
    index: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 获取商品列表
    this.get_goods_list();
  },
  // 获取商品列表
  get_goods_list: function () {
    var that = this;
    var requestUrl = 'Consumer/get_goods_list';
    request.get(requestUrl, {
      data: { 
        from: 'categoryone',
        type: 'integral' 
      },
      success: function (res) {
        console.log("获取商品列表", res.data.list);
        that.setData({ goods_list: res.data.list })
      }
    })
  },

})