// pages/intefral_mall/integral_detail/integral_detail.js
var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var WxParse = require('../../../utils/wxParse/wxParse.js');
var common = require('../../../utils/common.js');
let animationShowHeight = 600;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: setting.url,
    resourceUrl: setting.resourceUrl,
    goodsInfo: {}, // 商品所有信息
    goodsSlide: [], // 轮播图
    heart_type: 0, // 收藏切换时心型切换的默认索引

    openSpecModal: false, //是否打开规格弹窗
    animationData: "",
    goodsInputNum: 1, //选中的商品件数
    //测试keycode
    keycode: '',

    heart_name: 'ios-heart-outline',
    supportPageScroll: false, //微信版本是否支持页面滚动回顶部
    done: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log("积分兑换商品详情",options);
    // 根据不同的商品，显示不同的title
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

  /**切换类型 */
  // check_heart_type: function () {
  //   var that = this;
  //   if (this.heart_type != 0 && this.heart_type % 2 != 0) {
  //     that.setData({ heart_name: 'ios-heart' })
  //   } else if (this.heart_type != 0 && this.heart_type % 2 == 0) {
  //     that.setData({ heart_name: 'ios-heart-outline' })
  //   }
  // },
  /** 方法  收藏商品 */
  collection_this: function () {
    var that = this;
    that.data.heart_type++;

    if (this.heart_type != 0 && this.heart_type % 2 != 0) {
      that.setData({
        // heart_name: 'ios-heart',
        done: 1
      })
    } else if (this.heart_type != 0 && this.heart_type % 2 == 0) {
      that.setData({
        // heart_name: 'ios-heart-outline',
        done: 2
      })
    }
    request.post('Consumer/collection_goods', {
      data: {
        goodid: that.data.goods.goods_id,
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
  /** 打开规格弹窗 */
  openSpecModel: function () {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    this.animation = animation;
    animation.translateY(animationShowHeight).step();
    this.setData({
      animationData: animation.export(),
      openSpecModal: true
    });
    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        animationData: animation.export()
      });
    }.bind(this), 0);
    this.setData({ openSpecModal: true });
  },
  /** 关闭规格弹窗 */
  closeSpecModal: function () {
    // 隐藏遮罩层  
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    this.animation = animation;
    animation.translateY(animationShowHeight).step();
    this.setData({
      animationData: animation.export(),
    });
    setTimeout(function () {
      animation.translateY(0).step();
      this.setData({
        animationData: animation.export(),
        openSpecModal: false
      });
    }.bind(this), 200);
    this.setData({ openSpecModal: false });
  },

  /** 增加购买的商品数量 */
  addCartNum: function (e) {
    this.checkCartNum(this.data.goodsInputNum + 1);
  },
  /** 减少购买的商品数量 */
  subCartNum: function (e) {
    this.checkCartNum(this.data.goodsInputNum - 1);
  },
  /** 输入购买的数量 */
  inputCartNum: function (e) {
    this.checkCartNum(Number(e.detail.value));
  },
  /** 检查购买的数量 */
  checkCartNum: function (num) {
    var that = this;
    var stock = that.data.goodsInfo.store_count;
    if (that.data.goodsInfo.store_count > 0) {
        stock = that.data.goodsInfo.store_count;
    }
    if (num > stock || stock == 0) {
      num = stock;
    } else if (num < 1) {
      num = 1;
    }
    this.setData({ goodsInputNum: num });
  },
  /**方法 加入购物车 */
  addCart: function(){
    var that = this;
    var requestUrl = '/Cart/generalAddCart';
    request.post(requestUrl,{
      data:{
        goods_id: that.data.goodsInfo.goods_id,
        goods_num: that.data.goodsInputNum,
      },
      success:function(res){
        if(res.data.status == 1){
          wx.showToast({
            title: '添加购物车成功',
            icon: 'none',
            image: '',
            duration: 3000,
          });
            
        }
      }
    })
  },

  /**购物车列表 */
  gotoCart: function () {
    wx.navigateTo({
      url: '/pages/intefral_mall/integral_cart/integral_cart',
     
    });

  },

  /** 返回顶部 */
  doScrollTop: function () {
    wx.pageScrollTo({ scrollTop: 0 });
  },


})