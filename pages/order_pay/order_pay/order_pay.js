// pages/order_pay/order_pay/order_pay.js
var app = getApp();
var request = app.request;
var pay = require('../../../utils/pay.js');
var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.globalData.setting.url,
    resourceUrl: app.globalData.setting.resourceUrl,
    order: {},
    useWxPay: true,
    paymentList: [],
    orderinfo:{
      order_sn: '', 
      sum_order_amount: 0 , 
      pay_code: null,pay_status: 0
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.order.order_sn = options.order_sn;
    // 获取订单详情
    var requestUrl = '/Payment/pay_orderinfo';
    // request.post(requestUrl,{
    //   data:{
    //     order_sn: options.order_sn,
    //     askurl: options.askurl
    //   },
    //   failRollback: true,
    //   success: function(res){
    //     if(res.data.status == 1){
    //       that.setData({orderinfo: res.data.result.orderinfo})
    //       if(res.data.result.paymentList){
    //         that.setData({paymentList: res.data.paymentList})
    //       };
    //       if(res.data.ShareObj){

    //       }
         
    //     }
    //   }
    // })
  },

  
  

  
})