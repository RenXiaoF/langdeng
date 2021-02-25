// pages/user/my_recommend/my_recommend.js
var app = getApp();
var request = app.request;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fans_list: [],
    statac: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 我的推荐
    this.getmyfans();
  },

  /**我的推荐 */
  getmyfans:function(){
    var that = this;
    var requestUrl = "Consumer/my_fans";
    request.get(requestUrl,{
      success:function(res){
        console.log("我的推荐",res.data.list);
        if(res.data.status > 0 && res.data.done == 1 ){
          that.setData({
            statac: 1,
            fans_list: res.data.list,
          })
        }else if(res.data.done == 2 ){
          that.setData({statac: 2})
        }
      }
    })
  }


})