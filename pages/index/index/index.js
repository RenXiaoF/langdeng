//获取应用实例
var app = getApp();
var request = app.request;
var setting = app.globalData.setting;
var util = require('../../../utils/util.js');
var common = require('../../../utils/common.js');
import LoadMore from '../../../utils/LoadMore.js';
var load = new LoadMore;

Page({
    data: {
        url: setting.url,
        resourceUrl: setting.resourceUrl,
        logo: setting.appLogo,
        magicList: null, //魔法首页
        supportPageScroll: false, //微信版本是否支持页面滚动回顶部
    },

    //事件处理函数
    onLoad: function () {
        wx.setNavigationBarTitle({
            title: setting.appName,
        });
        //以前有登录过，则直接登录
        // if (app.auth.hadAuth()) {
        //     app.getUserInfo();
        // }
        load.init(this, '', 'recommend');


        //魔法首页
        this.requestGetMagic();
        //是否支持返回按钮
        if (wx.pageScrollTo) {
            this.setData({ supportPageScroll: true });
        }
    },

    //魔法首页
    requestGetMagic: function () {
        var that = this;
        var requestUrl = 'index/get_index';
        request.get(requestUrl, {
            success: function (res) {
                console.log("首页请求数据", res.data.magicList);
                that.setData({
                    magicList: res.data.magicList
                })
            },

        });
    },

    // ml传参无效  魔法首页页面跳转
    /**wx.switchTab: url 不支持 queryString */
    gotoPage: function (e) {
        // 临时定义的全局变量，用于保存需要传递的参数：id，传到目标tabBar页
        app.globalData.community_id_for_switch_tab = e.currentTarget.dataset.cid;
        wx.switchTab({
            url: '/pages/goods/category-one/category-one',
            
        });
          
    },

    /**返回顶部 */
    doScrollTop: function () {
        wx.pageScrollTo({ scrollTop: 0 });
    },

});
