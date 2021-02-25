// pages/user/apply_list/apply_list.js
var app = getApp();
var request = require('../../../utils/request.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.globalData.setting.url,
    resourceUrl: app.globalData.setting.resourceUrl,
    applylist:null,
    currentPage:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.requestApplyList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.requestApplyList();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.requestApplyList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 请求列表数据
   */
  requestApplyList: function() {
    var that=this;
    request.get(that.data.url + '/api/user/getApplyList/p/'+that.data.currentPage, {
      success: function (res) {
        var applylist = res.data.result.apply_list;
        var customertype = res.data.result.customer_type;
        
        for(var i in applylist){
          for(var n in customertype){
            if(applylist[i].type == n){
              applylist[i].type = customertype[n];
            }
          }
        }
        that.setData({applylist:applylist});
        wx.stopPullDownRefresh();
      }
    })
  },

  //修改
  editApply: function(e) {
    var apply = this.getApplyData(e.currentTarget.dataset.id);
    var params = '';
    for (var item in apply) {
      params += (params.length != 0 ? '&' : '?') + (item + '=' + apply[item]);
    }
    params && wx.navigateTo({ url: "/pages/user/add_apply/add_apply" + params });
  },

  getApplyData: function(id) {
    var apply = this.data.applylist;
    console.log(apply);
    for(var idx in apply){
      if(apply[idx].id==id){
        break;
      }
    }
    if (!idx) {
      return {};
    }
    return apply[idx];
  }
})