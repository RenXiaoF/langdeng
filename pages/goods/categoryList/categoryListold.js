var app = getApp();
var request = app.request;

Page({
    data: {
        url: app.globalData.setting.url,
        firstCategoris: [],
        categories: [],
        ad: null, //广告
        currentCategoryId: 0, //目前的第一分类id
        scrollHeight: 0, //界面高度，用于滚动
    },

    onLoad: function () {
        this.requestFirstCategoris();
    },
    // 一级分类
    requestFirstCategoris: function () {
        var that = this;
        request.post('/api/goods/goodsCategoryList', {
            data: { new_ad: 1 },
            success: function (res) {
                if (res.data.result.adv != null) {
                    that.setData({ ad: res.data.result.adv });
                }
                var categories = res.data.result.category;
                if (categories.length == 0) {
                    return;
                }
                that.setData({ firstCategoris: categories });
                that.requestCategories(categories[0].id);
            }
        });
    },

    //请求分类 二级 和三级 分类
    requestCategories: function (parenId) {
        var that = this;
        request.get('/api/goods/goodsSecAndThirdCategoryList', {
            data: { 'parent_id': parenId },
            success: function (res) {
                console.log('res.data.result');
                console.log(res.data.result);
                that.setData({
                    categories: res.data.result,
                    currentCategoryId: parenId
                });
            }
        });
    },

    //切换第一分类
    switchFirstCategory: function (e) {
        this.requestCategories(e.currentTarget.dataset.id);
    },

    goodsList: function (e) {
        var catId = e.currentTarget.dataset.id;
        wx.navigateTo({ url: '/pages/goods/goodsList/goodsList?cat_id=' + catId, })
    },

    jumpSearch: function () {
        wx.navigateTo({ url: "/pages/goods/search/search" });
    },

})