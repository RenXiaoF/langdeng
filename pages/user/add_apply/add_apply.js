var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
import Regions from '../../../utils/regions/Regions.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    applytype: ['终端', '代理'],
    index: 0,
    url: setting.url,
    resourceUrl: setting.resourceUrl,
    apply: {}, //地址信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({ apply: options });

    app.getUserInfo(function (userInfo) {
      that.setData({ user: userInfo });
    });
    this.initRegions();
  },

  /** 初始化区域弹框相关 */
    initRegions: function () {
    var that = this;
    new Regions(this, 'regions', {
      endAreaLevelCall: function (parentId, regionName, apply) {
        Object.assign(that.data.apply, apply);
        
        that.setData({
          'apply.province_name': that.data.apply.province_name,
          'apply.city_name': that.data.apply.city_name,
          'apply.district_name': that.data.apply.district_name,
          // 'apply.twon_name': that.data.apply.twon_name,
        });
      }
    });
  },

  //客户类型选择
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  //提交
  submitApply: function (e) {
    var apply = this.data.apply;
    Object.assign(apply, e.detail.value);
    console.log("applysubmit");
    console.log(apply);
    if (!apply.customer_name || !apply.short_name || !apply.picktype || !apply.link_name || !apply.link_tel || !apply.province || !apply.address || !apply.id_card || !apply.bank_card){
      app.showWarning('信息不完整！');
      return false;
    }
    switch(apply.picktype){
      case '终端':
        apply.picktype = 1;
      case '代理':
        apply.picktype = 2;
    }

    request.post('/api/user/addApply', {
      data: {
        customer_name: apply.customer_name,
        short_name: apply.short_name,
        picktype: apply.picktype,
        link_name: apply.link_name,
        link_tel: apply.link_tel,
        province: apply.province,
        city: apply.city,
        district: apply.district,
        // twon: apply.twon,
        address:apply.address,
        id_card:apply.id_card,
        bank_card:apply.bank_card,
        apply_id:apply.id?apply.id:'',
      },
      // data:apply,
      success: function (res) {
        app.showSuccess(res.data.msg, function () {
          wx.navigateBack();
        });
      }
    });
  },
})