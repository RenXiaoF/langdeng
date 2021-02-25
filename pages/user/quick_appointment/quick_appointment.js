// pages/user/quick_appointment/quick_appointment.js
var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var util = require('../../../utils/util.js');
var md5 = require('../../../utils/md5.js');
var common = require('../../../utils/common.js');
import Regions from '../../../utils/regions/Regions.js';

const date = new Date()
const years = []
const months = []
const days = []

for (let i = 2010; i <= date.getFullYear(); i++) {
  years.push(i)
}

for (let i = 1; i <= 12; i++) {
  months.push(i)
}

for (let i = 1; i <= 31; i++) {
  days.push(i)
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: setting.url,
    resourceUrl: setting.resourceUrl,
    user: null,
    address: {}, // 收货地址
    cost: null, // 用户基本信息
    datalist: [],
    newdate: '',
    dattt: '',
    onType: 'push',
    good_id: 0,
    userInfo: {
      mobile: '',
      address: '',
      province_name: '',
      city_name: '',
      district_name: '',
      twon_name: '',
      realname: '',
      date: '',
      good_id: 0
    },

    years: years,
    year: date.getFullYear(),
    months: months,
    month: 2,
    days: days,
    day: 2,
    value: [9999, 1, 1],

    shipping: null,
    shipping_index: 0

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //  获得用户的基本 信息
    this.get_my_money();
    var that = this;
    // 收货地址
    that.setData({ address: options });
    // 用户详情
    app.getUserInfo(function (userInfo) {
      that.setData({
        user: userInfo,
      });
    });
    // 初始化区域弹框相关
    this.initRegions();
    // 30天
    this.text();

  },

  bindChange: function (e) {
    const val = e.detail.value
    this.setData({
      year: this.data.years[val[0]],
      month: this.data.months[val[1]],
      day: this.data.days[val[2]]
    })
  },

  /** 初始化区域弹框相关 */
  initRegions: function () {
    var that = this;
    new Regions(this, 'regions', {
      endAreaLevelCall: function (parentId, regionName, address) {
        Object.assign(that.data.address, address);
        that.setData({
          'address.province_name': that.data.address.province_name,
          'address.city_name': that.data.address.city_name,
          'address.district_name': that.data.address.district_name,
          'address.twon_name': that.data.address.twon_name,
        });
      }
    });
  },
  /**获取用户基本信息 */
  get_my_money: function () {
    var that = this;
    var requestUrl = "Consumer/get_my_money_address";
    request.get(requestUrl, {
      success: function (res) {
        if (res.data.status > 0) {
          that.setData({
            cost: res.data.re,
          })
        }
      }
    })
  },
  /**30天 */
  text: function () {
    var that = this;
    for (var i = 1; i <= 30; i++) {
      that.data.datalist.push(i);
    }
  },
  /**选择预约时间 */
  turnn: function () {
    var that = this;
    //当前时间
    var date = new Date();
    var time = Date.parse(String(date)) / 1000;
    //选择天数
    // console.log(this.dattt);
    var newt = this.data.dattt * 86400;
    //最终时间
    var datatimes = time + newt;
    that.data.userInfo.date = String(datatimes);
    // console.log(datatimes);
    if (newt == 0) {
      this.data.newdate = "今天内 ";
    } else {
      date.setTime(datatimes * 1000);
      var y = date.getFullYear();
      var m = date.getMonth() + 1;
      var nm = m < 10 ? ('0' + m) : m;
      var d = date.getDate();
      var nd = d < 10 ? ('0' + d) : d;
      that.setData({ newdate: y + '-' + nm + '-' + nd + ' 前' })
      // this.data.newdate = y + '-' + nm + '-' + nd + ' 前';
    }
  },
  /**picker的绑定方法 */
  selectShipping: function (e) {
    this.setData({ 'shipping_index': e.detail.value })
  },
  /** 提交表单 */
  requestUpdateUser: function () {
    var that = this;
    var requestUrl = "Consumer/add_appointment";
    if (
      this.data.userInfo.mobile == '' ||
      this.data.userInfo.address == '' ||
      this.data.userInfo.realname == '' ||
      this.data.userInfo.city == '' ||
      this.data.userInfo.area == '' ||
      this.data.userInfo.province == '' ||
      !this.data.userInfo.date
    ) {
      wx.showToast({
        title: '提交前请完善资料',
        icon: 'none',
        duration: 2000
      })
    }
    request.post(requestUrl, {
      data: that.data.userInfo,
      success: function (res) {
        if (res.data.done == 1) {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
          // if(that.data.onType == 'load'){

          // }else{

          // }
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: function (err) {
        console.log("提交-快速预约表单", err)
      }
    })
  }



})