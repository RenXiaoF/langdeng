// pages/user/reservation/reservation.js
var app = getApp();
var request = app.request;
import LoadMore from "../../../utils/LoadMore";
var load = new LoadMore;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.globalData.setting.url,
    resourceUrl: app.globalData.setting.resourceUrl,
    resetype: 'all', // 切换标签--重置类型
    anp_list: [], // 我的预约列表
    stazt: 0, // 
    ordertypes: [
      { name: '全部', id: 0, },
      { name: '安排中', id: 1, },
      { name: '已完成', id: 2, },
      { name: '已取消', id: 3, },
    ],
    activeCategoryId: 0, // 顶部标题的默认索引
    currentPage: 1 // 当前页面
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 顶部标题的传入的索引
    var id = typeof options.type == 'undefined' ? this.data.activeCategoryId : options.type;
    // 负载初始化
    load.init(this, '', 'reservation');
    this.turn_list(id); //  获取预约列表
  },

  onShow: function () {
    if (wx.getStorageSync('order:reservation:update')) {
      wx.setStorageSync('order:reservation:update', false);
      this.resetData();
      this.turn_list(this.data.activeCategoryId);
    }
  },

  /**切换表头 */
  changeTab: function (e) {
    this.resetData();
    this.turn_list(e.currentTarget.id);
  },
  //重置数据
  resetData: function () {
    load.resetConfig();
    this.data.anp_list = null;
    this.data.currentPage = 1;
  },

  /** 获取预约列表 */
  turn_list: function (categoryId) {
    var that = this;
    var requestUrl = 'Consumer/my_appoint_order';
    var tabType = '';
    if (categoryId == 0) {
      tabType = 'all';
    } else if (categoryId == 1) {
      tabType = 'doing';
    } else if (categoryId == 2) {
      tabType = 'done';
    } else if (categoryId == 3) {
      tabType = 'close'
    }
    if (tabType) {
      requestUrl += '?type=' + tabType;
    }
    that.setData({ activeCategoryId: categoryId });
    request.get(requestUrl, {
      data: {
        user_id: app.globalData.userInfo.user_id,
        mobile: app.globalData.userInfo.mobile,
        type: tabType,
      },
      success: function (res) {
        console.log("获取预约列表", res.data);
        that.setData({ anp_list: res.data.appoint_list });
        if (res.data.appoint_list.length > 0) {
          that.setData({ stazt: 1 })
        } else {
          that.setData({ stazt: 2 })
        }
      }
    })
  },

  /**取消预约 showModal */
  confirm_close: function (inx, id) {
    wx.showModal({
      title: '确定取消',
      content: '',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定');
          /**取消预约的方法 */
          // cancel_reservation: function() {
          var that = this;
          var requestUrl = "Consumer/close_apppoint";
          request.get(requestUrl, {
            data: {
              ap_id: id,
              user_id: app.globalData.userInfo.user_id
            },
            success: function (res) {
              console.log("取消预约的方法", res.data);
              that.data.anp_list.splice(inx, 1);
            }
          })
          // },
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})