// pages/intefral_mall/add_address/add_address.js
var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
import Regions from '../../../utils/regions/Regions.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: setting.url,
    resourceUrl: setting.resourceUrl,

    address: {}, //收货地址信息
    is_default: false,  // 默认是否选中
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.setData({ address: options });
    app.getUserInfo(function (userInfo) {
      that.setData({ user: userInfo });
    });
    // 初始化区域弹框相关
    this.initRegions();
    // 获得地址详情
    this.getAddressInfo();
  },

  /**获得地址详情 */
  getAddressInfo:function(){
    var that = this;
    var requestUrl = 'User/getRegionList';
    request.post(requestUrl,{
      success:function(res){
        if(res.data.status == 1 ){
          that.setData({address: res.data.result.address_list})
        }
      }
    })
  },

  /**添加地址 */
  newaddress: function (e) {
    var that = this;
    var requestUrl = 'Cart/add_address';
    var address = that.data.address;
    Object.assign(address, e.detail.value);
    address.is_default = Number(address.is_default);
   
    request.post(requestUrl, {
    
      data: address,
      success: function (res) {
        if (res.data.status == 1) {
          app.showSuccess(res.data.msg, function () {
            wx.navigateBack();
          });
        } else {
          console.log(res.data.msg);
        }
      }
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
})