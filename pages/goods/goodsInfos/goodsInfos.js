// pages/goods/goodsInfos/goodsInfos.js
var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var WxParse = require('../../../utils/wxParse/wxParse.js');
var common = require('../../../utils/common.js');
// import qkapp from '../../../user/quick_appointment/quick_appointment.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: setting.url,
    resourceUrl: setting.resourceUrl,
    goodsInfo: {}, // 商品所有信息
    goodsSlide: [],// 轮播图
    heart_type: 0,
    supportPageScroll: false, //微信版本是否支持页面滚动回顶部
    done: 0,
    goodsAttrs: null, //商品属性列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log("商品详情",options.good_id);
    // 根据不同的商品，显示不同的title. 放弃使用：options中只有good_id。
    wx.setNavigationBarTitle({
      title: options.goods_name !== '' ? options.goods_name : '商品详情',
    });
    var that = this;
    // 获取类型
    // request.get('Consumer/get_heart_type', {
    //   data: { goodid: options.goods_id },
    //   success: function (res) {
    //     console.log("获取类型", res);
    //     if (res.data.status > 0) {
    //       that.setData({ heart_type: 1 })
    //     } else {
    //       that.setData({ heart_type: 2 })
    //     }
    //     // this.check_heart_type();
    //   }
    // })
    // 获取商品详情
    request.get('Consumer/get_the_good', {
      data: { good_id: options.good_id },
      success: function (res) {
        console.log("商品详情", res.data);
        WxParse.wxParse('content', 'html', res.data.good.goods_content, that, 6);
        //网页中的图片加上域名
        common.wxParseAddFullImageUrl(that, 'content');
        if (res.data.status > 0 && res.data.done == 1) {
          that.setData({
            goodsInfo: res.data.good,
            goodsSlide: res.data.good.imgs_list
          });
          
        }
      }
    });

    //是否支持返回按钮
    if (wx.pageScrollTo) {
      this.setData({ supportPageScroll: true });
    }
  },

  initRegions: function () {
    var that = this;
    new qkapp(this, 'qkapp'
    //  {
        // endAreaLevelCall: function (parentId, regionName, address) {
        //     Object.assign(that.data.address, address);
        //     that.setData({
        //         'address.province_name': that.data.address.province_name,
        //         'address.city_name': that.data.address.city_name,
        //         'address.district_name': that.data.address.district_name,
        //         'address.twon_name': that.data.address.twon_name,
        //     });
        // }
    // }
    );
},

  /** 方法  收藏商品 */
  collection_this: function () {
    var that = this;
    var heart = that.data.heart_type++;

    if (heart != 0 && heart % 2 != 0) {
      that.setData({
        done: 1
      })
    } else if (heart != 0 && heart % 2 == 0) {
      that.setData({
        done: 2
      })
    }
    request.post('Consumer/collection_goods', {
      data: {
        goodid: that.data.goodsInfo.goods_id,
        donetype: that.data.done
      },
      success: function (res) {
        console.log("收藏商品", res.data);
        if (res.data.status > 0) {
          let str = '失败';
          if (that.data.done == 1) {
            if (res.data.recode == 1) {
              str = '收藏成功';
            } else {
              str = '请稍后再试试';
            }
          } else if (that.data.done == 2) {
            str = '取消成功';
          }
          wx.showToast({
            title: str,
            icon: 'none',
            image: '',
            duration: 2000,
          });

        }
        // that.setData({ 'data.goods.is_collect': !that.data.data.goods.is_collect });
      }
    });
  },

  /** 返回顶部 */
  doScrollTop: function () {
    wx.pageScrollTo({ scrollTop: 0 });
},


})