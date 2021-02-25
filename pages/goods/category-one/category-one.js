// pages/goods/category-one/category-one.js
var app = getApp();
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;
var request = app.request;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.globalData.setting.url,
    resourceUrl: app.globalData.setting.resourceUrl,
    currentPage: 1,
    openFilterModal: false, //打开筛选弹框
    requestData: null, //请求的数据
    allData: null, //第一次请求到的所有数据，用于恢复筛选数据
    catelist: [], // 筛选列表
    baseUrl: 'Consumer/get_goods_list', // 基地址
    requestUrl: '', //请求的链接
    supportPageScroll: false, //微信版本是否支持页面滚动回顶部
    goods_list: [], // 获取的商品列表
    cate_list: [],
    catelistid: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options");
    console.log(options);
    var catelist = options.catelist;
    // 获取商品列表
    this.get_goods_list();
    // 筛选
    this.get_the_cat();
    //是否支持返回按钮
    if (wx.pageScrollTo) {
      this.setData({ supportPageScroll: true });
    }
  },

  /**预加载 */
  onShow:function(){
    var that = this;
    // 从首页index传过来的id，用临时的全局变量接受。
    var val = app.globalData.community_id_for_switch_tab;
    console.log("预加载",val);
    var requestUrl = 'Consumer/get_goods_list';
    request.get(requestUrl, {
      data: {
        keyword: '',
        catelist: val ? val : 0,
        from: 'categoryone'
      },
      success: function (res) {
        console.log("获取商品列表", res.data.list);
        that.setData({ goods_list: res.data.list })
      }
    });
    // 切记：最后一定要还原全局变量的数据。
    app.globalData.community_id_for_switch_tab = 0;
  },

  /**打开过滤模式 */
  openFilterModal: function () {
    this.setData({ openFilterModal: true });
  },
  /**关闭过滤模式 */
  closeFilterModal: function () {
    this.setData({ openFilterModal: false });
  },
  /** 恢复数据 */
  restoreData: function () {
    this.setData({ 'requestData': this.data.allData });
  },
  /** 商品筛选 */
  filterGoods: function (e) {
    console.log("筛选商品",e);
    this.resetData();
    // this.get_goods_list();
    this.requestSearch(e.currentTarget.dataset.href);
    this.closeFilterModal();
  },

  /** 重置数据 */
  resetData: function () {
    load.resetConfig();
    this.data.requestData = null;
    this.data.currentPage = 1;
  },
  /** 提交搜索事件 */
  submitSearch: function (e) {
    this.search(e.detail.value.word);
  },

  /** 点击搜索热词事件 */
  searchHotWord: function (e) {
    this.search(e.currentTarget.dataset.word);
  },

  /** 对搜索词进行搜索--搜索框 */
  search: function (word) {
    this.resetData();
    this.requestSearch(this.data.baseUrl + '?keyword=' + word);
    // this.requestSearch();
  },

  /**请求搜索 */
  requestSearch: function (requestUrl) {
    var that = this;
    this.data.requestUrl = requestUrl; //保存链接
    requestUrl += (requestUrl.indexOf('?') > 0 ? '&' : '?') + 'page=' + that.data.currentPage;
    load.request(requestUrl, function (res) {
      that.data.currentPage++;
      if (that.data.allData == null) {
        that.data.allData = Object.assign({}, res.data.result);
      }
      that.closeSearchModal();
    });
  },

  /**筛选弹框的数据请求 */
  get_the_cat: function () {
    var that = this;
    var requestUrl = 'Consumer/get_the_cat';
    request.get(requestUrl, {
      data: { from: "filter" },
      success: function (res) {
        that.setData({ catelist: res.data.catelist })
      }
    })
  },

  // 获取商品列表
  get_goods_list: function () {
    var that = this;
    var requestUrl = 'Consumer/get_goods_list';
    request.get(requestUrl, {
      data: {
        keyword: '',
        // catelistid: e.currentTarget.dataset.id,
        // catelist: 7,
        from: 'categoryone'
      },
      success: function (res) {
        console.log("获取商品列表", res.data.list);
        that.setData({ goods_list: res.data.list })
      }
    })
  },

  /** 返回顶部 */
  doScrollTop: function () {
    wx.pageScrollTo({ scrollTop: 0 });
  },


})