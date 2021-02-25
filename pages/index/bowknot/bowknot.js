
// pages/index/bowknot/bowknot.js
var app = getApp();
var request = app.request;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.globalData.setting.url,
    resourceUrl: app.globalData.setting.resourceUrl,
    // catetype: any,
    catelist: [], // 商品分类
    goods_list: [], // 商品列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 商品列表
    this.get_type_goods();
    // 商品分类
    this.get_the_cat();
  },
  /** 获得商品列表 */
  get_type_goods:function(){
    var that = this;
    var data = {
      from:'categorytwo',
      type:this.catetype,
    };
    var requestUrl = 'Consumer/get_goods_list';
    request.get(requestUrl,{
      // data: data,
      success:function(res){
        console.log("商品列表",res.data.list );
        that.setData({
          goods_list: res.data.list
        })
      }

    })
  },
  /** 商品分类 */
  get_the_cat: function(){
    var that = this;
    var data = {
      from:'categorytwo',
    };
    var requestUrl = 'Consumer/get_the_cat';
    request.get(requestUrl,{
      // data:data,
      success:function(res){
        console.log("商品分类",res.data.catelist);
        that.setData({
          catelist: res.data.catelist
        })
      }
    })
  }



})