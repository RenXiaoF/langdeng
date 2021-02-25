var app = getApp();
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        currentPage: 1,
        requestData: null, //请求的数据
        allData: null, //第一次请求到的所有数据，用于恢复筛选数据
        openFilterModal: false, //打开筛选弹框
        openSearchModal: false, //打开搜索界面
        baseUrl: '/api/goods/search', //基地址
        // baseUrl: '/api/Goods/wechat_searchGoods', //基地址
        requestUrl: '', //请求的链接
        hotWords: [['手机', '小裤', '新品'], ['背背佳', '休闲', '保暖']], //搜索热词
    },
    
    onLoad: function (options) {
        load.init(this, 'goods_list', 'requestData');
        if (typeof options.brand_id != 'undefined') {
            return this.requestSearch(this.data.baseUrl + '?brand_id=' + options.brand_id);
        }
        this.openSearchModal();
    },
    /**改变标签 */
    changeTab: function (e) {
        this.resetData();
        this.requestSearch(e.currentTarget.dataset.href);
    },
    /**请求搜索 */
    requestSearch: function (requestUrl) {
        var that = this;
        this.data.requestUrl = requestUrl; //保存链接
        requestUrl += (requestUrl.indexOf('?') > 0 ? '&' : '?') + 'p=' + that.data.currentPage;
        load.request(requestUrl, function (res) {
            that.data.currentPage++;
            if (that.data.allData == null) {
                that.data.allData = Object.assign({}, res.data.result);
            }
            that.closeSearchModal();
        });
    },
    /**上拉触底 */
    onReachBottom: function () {
        if (this.data.openSearchModal) {
            return;
        }
        if (load.canloadMore()) {
            this.requestSearch(this.data.requestUrl);
        }
    },
    /**打开过滤模式 */
    openFilterModal: function () {
        this.setData({ openFilterModal: true });
    },
    /**关闭过滤模式 */
    closeFilterModal: function () {
        this.setData({ openFilterModal: false });
    },

    /** 商品筛选 */
    filterGoods: function (e) {
        this.resetData();
        this.requestSearch(e.currentTarget.dataset.href);
        this.closeFilterModal();
    },

    /** 重置数据 */
    resetData: function () {
        load.resetConfig();
        this.data.requestData = null;
        this.data.currentPage = 1;
    },

    /** 恢复数据 */
    restoreData: function () {
        this.setData({ 'requestData': this.data.allData });
    },
    /**打开搜索模式 */
    openSearchModal: function () {
        this.setData({ openSearchModal: true });
    },
    /**关闭搜索模式 */
    closeSearchModal: function () {
        this.setData({ openSearchModal: false });
    },

    /** 提交搜索事件 */
    submitSearch: function (e) {
        this.search(e.detail.value.word);
    },

    /** 点击搜索热词事件 */
    searchHotWord: function (e) {
        this.search(e.currentTarget.dataset.word);
    }, 

    /** 对搜索词进行搜索 */
    search: function (word) {
        if (typeof word != 'string' || word == '') {
            return app.showWarning('请输入搜索关键词');
        }
        this.resetData();
        this.requestSearch(this.data.baseUrl + '?q=' + word);
    }

});