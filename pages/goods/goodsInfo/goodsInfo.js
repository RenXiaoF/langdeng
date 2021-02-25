var util = require('../../../utils/util.js');
var common = require('../../../utils/common.js');
var WxParse = require('../../../utils/wxParse/wxParse.js');
var app = getApp();
var request = app.request;
var setting = app.globalData.setting;
let animationShowHeight = 300;

Page({
    data: {
        url: setting.url,
        resourceUrl: setting.resourceUrl,
        defaultAvatar: setting.resourceUrl + "/static/images/user68.jpg",
        data: null, //请求的商品详情数据
        result: null,
        content: '', //商品详情页html
        goodsAttrs: null, //商品属性列表
        cartGoodsNum: 0, //购物车商品数量
        specSelect: 0, //选中的组合规格数组spec_goods_price下标
        optionItemId: 0, //页面参数，页面初始化指定显示的itemid，用于活动
        goodsInputNum: 1, //选中的商品件数
        openSpecModal: false, //是否打开规格弹窗
        openPromModal: false, //是否打开优惠信息弹窗
        animationData: "",
        showStore: false,
        activeCategoryId: 0, //商品主页tab
        supportPageScroll: false, //微信版本是否支持页面滚动回顶部
        address: {
            address: '',
            district: 0,
        },
        shipping: '',
        shippingCost: 0,
        enterAddressPage: false,
        categories: [
            { name: "商品", id: 0 },
            { name: "详情", id: 1 },
            { name: "评论", id: 2 }
        ],
        activeCategoryId2: 0, //商品内容tab
        categories2: [
            { name: "商品详情", id: 0 },
            { name: "规格参数", id: 1 },
        ],
        activeCategoryId3: 0, //商品评论tab
        categories3: [
            { name: "全部评价", id: 0, num: 0 },
            { name: "好评", id: 1, num: 0 },
            { name: "中评", id: 2, num: 0 },
            { name: "差评", id: 3, num: 0 },
            { name: "有图", id: 4, num: 0 }
        ],
        select: { //选择的(规格)商品的参数，用于显示
            price: 0,
            stock: 0,
            spec_img: '',
            specName: '',
            activity: null
        },
        timer: null, //活动倒计时定时器
    },

    onLoad: function (options) {

        wx.setNavigationBarTitle({
            title: options.goods_name !== '' ? options.goods_name : '商品详情',
        });
        // 获取商品详情
        var that = this;
        // this.data.optionItemId = typeof options.item_id == 'undefined' ? 0 : options.item_id;
        request.get('Consumer/get_the_good', {
            data: { id: options.goods_id },
            // failRollback: true,
            success: function (res) {
                // that.initData(res.data.result);
                that.setData({ result: res.data.result });
                // that.requestGoodsContent();
                // that.refreshDispatch(res.data.result);
                // console.log("/api/goods/goodsInfo");
                console.log("商品详情",res.data.result);
            }
        });
         // 请求购物车数量 
        this.requestCardNum();
        //是否支持返回按钮
        if (wx.pageScrollTo) {
            this.setData({ supportPageScroll: true });
        }
        //小程序嵌套不能超过5层
        var pages = getCurrentPages();
        if (pages.length < 5) {
            this.setData({ showStore: true });
            return;
        }
    },
 
    //重新刷新物流数据
    onShow: function () {
        if (this.data.enterAddressPage) {
            this.data.enterAddressPage = false;
            this.refreshDispatch(this.data.result);
        }
        let that = this;
        wx.getSystemInfo({
            success: function (res) {
                animationShowHeight = res.windowHeight;
            }
        })
    },

    /**查询商品物流 */
    refreshDispatch: function (result) {
        var that = this;
        var consigneeAddress = wx.getStorageSync('goodsInfo:goodsInfo:address') ? wx.getStorageSync('goodsInfo:goodsInfo:address') : result.consignee;
        that.setData({
            'address.address': consigneeAddress.address,
            'address.district': consigneeAddress.district,
        });
        request.get('/api/goods/dispatching', {
            data: {
                goods_id: result.goods.goods_id,
                region_id: consigneeAddress.district,
            },
            success: function (res) {
                console.log("/api/goods/dispatching");
                console.log(res);
                var shippinginfo;
                if (res.data.result > 0) {
                    shippinginfo = '￥' + res.data.result;
                } else if (res.data.result == 0) {
                    shippinginfo = '包邮';
                } else {
                    shippinginfo = res.data.msg;
                }
                that.setData({ shippingCost: res.data.result });
                that.setData({ shipping: shippinginfo });
            },
        });
    },

    enterAddress: function () {
        this.data.enterAddressPage = true;
        wx.navigateTo({ url: '/pages/user/address_list/address_list?operate=selectAddress' });
    },

    onUnload: function () {
        this.destroyActivityTimer();
    },

    /** 初始化数据，注意顺序 */
    initData: function (data) {
        //初始化评论
        this.initComment(data);
        //初始化规格
        this.initSpecsPrice(data);
        //初始化店铺
        this.initStore(data);
        //检查一下购物的数量，可能无库存
        this.checkCartNum(this.data.goodsInputNum);
    },

    /** 初始化店铺 */
    initStore: function (data) {
        var s = data.store;
        s.avgScore = (s.store_desccredit / 3 + s.store_servicecredit / 3 + s.store_deliverycredit / 3).toFixed(2);
        s.descScoreDesc = common.getStoreScoreDecs(s.store_desccredit);
        s.serviceScoreDesc = common.getStoreScoreDecs(s.store_servicecredit);
        s.deliveryScoreDesc = common.getStoreScoreDecs(s.store_deliverycredit);
        this.setData({ 'data.store': s });
    },

    /** 初始化评论相关 */
    initComment: function (data) {
        //好评率
        data.goods.goodCommentRate = data.statistics.high_rate;
        //评论日期格式化
        for (var i = 0; i < data.comment.length; i++) {
            data.comment[i].addTimeFormat = util.formatTime(data.comment[i].add_time);
            data.comment[i].goods_rank = parseInt(data.comment[i].goods_rank);
        }
        //评论数
        this.data.categories3[0].num = data.statistics.total_sum;
        this.data.categories3[1].num = data.statistics.high_sum;
        this.data.categories3[2].num = data.statistics.center_sum;
        this.data.categories3[3].num = data.statistics.low_sum;
        this.data.categories3[4].num = data.statistics.img_sum;
        //渲染视图
        this.setData({
            categories3: this.data.categories3,
            data: data
        });
    },

    /** 初始化所有规格 */
    initSpecsPrice: function (data) {
        var specSelect = 0; //初始化选中第一个规格
        var specs = data.spec_goods_price;
        if (specs.length == 0) { //没有规格
            this.initActivity(this.data.data.activity);
            return;
        }
        //第一次请求的总数据中的activity默认是第一种规格的,可减少一次请求
        specs[0].activity = data.activity;
        if (this.data.optionItemId) { //指定规格
            for (var i = 0; i < specs.length; i++) {
                if (specs[i].item_id == this.data.optionItemId) {
                    specSelect = i;
                    break;
                }
            }
        } else { //初始化选库存不为0的规格
            for (var i = 0; i < specs.length; i++) {
                if (specs[i].store_count <= 0) {
                    continue;
                }
                specSelect = i;
                break;
            }
        }
        //生成子规格组(goods_spec_list)的各自选中项
        var specIds = specs[specSelect].key.split("_");
        var list = data.goods_spec_list;
        for (var i = 0; i < list.length; i++) {
            for (var j = 0; j < list[i].spec_list.length; j++) {
                if (util.inArray(list[i].spec_list[j].item_id, specIds)) {
                    list[i].selectItemId = list[i].spec_list[j].item_id;
                    break;
                }
            }
        }
        this.setData({
            specSelect: specSelect,
            'data.goods_spec_list': list,
            'data.spec_goods_price': specs
        });
        this.initSelectSpecGoods();
    },

    /** 初始化选中的规格商品 */
    initSelectSpecGoods: function () {
        var specSelect = this.data.specSelect;
        var specs = this.data.data.spec_goods_price;
        var itemId = specs[specSelect].item_id;
        if (specs[specSelect].prom_type == 0) {
            var noActivity = { prom_type: 0 };
            specs[specSelect].activity = noActivity;
            this.initActivity(noActivity);
        } else if (typeof specs[specSelect].activity != 'undefined') {
            this.initActivity(specs[specSelect].activity);
        } else {
            this.requestSpecInfo(specSelect);
        }
    },

    /** 请求规格商品的活动信息 */
    requestSpecInfo: function (specSelect) {
        var that = this;
        var specs = this.data.data.spec_goods_price;
        request.get('/api/goods/goods_activity', {
            data: {
                goods_id: this.data.data.goods.goods_id,
                item_id: specs[specSelect].item_id
            },
            success: function (res) {
                specs[specSelect].activity = res.data.result;
                that.initActivity(res.data.result);
            }
        });
    },

    /** 初始化显示的活动信息 */
    initActivity: function (activity) {
        if (activity.prom_type && activity.prom_type != 4 && activity.prom_type != 6) {
            var startTime = (new Date()).getTime();
            if (activity.prom_type == 1) { //抢购
                activity.priceName = '抢购价';
                activity.countName = '限时抢购';
            } else if (activity.prom_type == 2) { //团购
                activity.priceName = '团购价';
                activity.countName = '限时团购';
            } else if (activity.prom_type == 3) { //促销
                activity.countName = '优惠促销';
            }
            console.log(activity);
            activity.countTime = '--天--时--分--秒';
            if (!activity.diffTime) {
                activity.diffTime = (new Date()).getTime() - activity.server_current_time * 1000;
            }
        }
        this.setData({ 'select.activity': activity });
        this.destroyActivityTimer();
        this.createActivityTimer();
        this.initSelectedData();
    },

    /** 初始化选中的（规格）商品的显示参数 */
    initSelectedData: function () {
        var goods = this.data.data.goods;
        var activity = this.data.select.activity;
        var specs = this.data.data.spec_goods_price;
        var specSelect = this.data.specSelect;
        var stock = 0;
        var price = 0;
        var specImg = "/api/goods/goodsThumImages?goods_id=" + this.data.data.goods.goods_id + "&width=200&height=200";
        if (activity.prom_type == 1 || activity.prom_type == 2) {
            price = activity.prom_price;
            stock = activity.prom_store_count;
        } else if (activity.prom_type == 3) {
            price = activity.prom_price;
            stock = specs.length > 0 ? specs[specSelect].store_count : goods.store_count;
        } else if (specs.length > 0) {
            price = specs[specSelect].price;
            stock = specs[specSelect].store_count;
        } else {
            price = goods.shop_price;
            stock = goods.store_count;
        }
        if (specs.length > 0) {
            specImg = specs[specSelect].spec_img;
            if (!specImg) {
                specImg = "/api/goods/goodsThumImages?goods_id=" + this.data.data.goods.goods_id + "&width=200&height=200";
            }
        }
        if (goods.exchange_integral > 0) {
            price = price - goods.exchange_integral / parseInt(goods.point_rate);
            price = price.toFixed(2);
        }
        this.setData({
            'select.price': price,
            'select.stock': stock,
            'select.spec_img': specImg,
            'select.specName': specs.length > 0 ? specs[specSelect].key_name : '',
        });
    },

    /** 创建活动倒计时定时器 */
    createActivityTimer: function () {
        var activity = this.data.select.activity;
        if (!activity.prom_type) {
            return;
        }
        var that = this;
        this.data.timer = setInterval(function () {
            var remainTime = activity.prom_end_time * 1000 - (new Date()).getTime() + activity.diffTime;
            remainTime = util.remainTime(remainTime);
            that.setData({ 'select.activity.countTime': remainTime });
        }, 1000);
    },

    /** 销毁活动倒计时定时器 */
    destroyActivityTimer: function () {
        if (this.data.timer) {
            clearInterval(this.data.timer);
            this.data.timer = null;
        }
    },

    /** 商品首页 */
    tabClick: function (e) {
        var typeId = e.currentTarget.id;
        this.setData({
            activeCategoryId: typeId
        });
        if (typeId == 1) {
            this.tabGoodsContent();
        } else if (typeId == 2) {
            this.tabComment();
        }
    },

    /** 商品详情页 */
    tabClick2: function (e) {
        this.setData({
            activeCategoryId2: e.currentTarget.id
        });
    },

    /** 评论页 */
    tabClick3: function (e) {
        if (e.currentTarget.id == this.data.activeCategoryId3) {
            return;
        }
        this.setData({ activeCategoryId3: e.currentTarget.id });
        this.requestComments(this.data.data.goods.goods_id, e.currentTarget.id);
    },

    /** 请求评论数据 */
    requestComments: function (goodsId, commentType) {
        var that = this;
        commentType++;
        var requestUrl = that.data.url + '/api/goods/getGoodsComment?goods_id=' + goodsId + '&type=' + commentType;
        console.log(requestUrl);
        request.get(requestUrl, {
            success: function (res) {
                var comments = res.data.result;
                for (var i = 0; i < comments.length; i++) {
                    comments[i].addTimeFormat = util.formatTime(comments[i].add_time);
                    comments[i].goods_rank = parseInt(comments[i].goods_rank);
                }
                that.setData({ comments: comments });
            }
        });
    },

    /** 返回顶部 */
    doScrollTop: function () {
        wx.pageScrollTo({ scrollTop: 0 });
    },

    /** 打开评论页 */
    tabComment: function () {
        this.setData({ activeCategoryId: 2 });
        if (!this.data.comments) {
            this.requestComments(this.data.data.goods.goods_id, this.data.activeCategoryId3);
        }
    },

    /** 打开商品内容详情页 */
    tabGoodsContent: function () {
        this.setData({ activeCategoryId: 1 });
    },

    /** 请求商品详情页嵌入的html内容 */
    requestGoodsContent: function () {
        var that = this;
        request.get('/api/goods/goodsContent', {
            data: { id: this.data.data.goods.goods_id },
            success: function (res) {
                WxParse.wxParse('content', 'html', res.data.result.goods_content, that, 6);
                //网页中的图片加上域名
                common.wxParseAddFullImageUrl(that, 'content');
                that.setData({ goodsAttrs: res.data.result.goods_attr_list });
            },
        });
    },

    /** 点击规格按钮的回调函数 */
    selectSpec: function (e) {
        //对商品数量进行判断，对库存进行判断
        var itemId = e.currentTarget.dataset.itemid;
        var listIdx = e.currentTarget.dataset.listidx;
        var list = this.data.data.goods_spec_list;
        if (list[listIdx].selectItemId == itemId) {
            return;
        }
        list[listIdx].selectItemId = itemId;
        var newSpecKeys = [];
        for (var i = 0; i < list.length; i++) {
            newSpecKeys[i] = list[i].selectItemId;
        }
        //item排序,生成key
        var newSpecKeys = util.sortSize(newSpecKeys).join('_');
        var newSpecSelect = 0;
        var specs = this.data.data.spec_goods_price;
        for (var i = 0; i < specs.length; i++) {
            if (specs[i].key == newSpecKeys) {
                newSpecSelect = i;
                break;
            }
        }
        this.setData({
            specSelect: newSpecSelect,
            'data.goods_spec_list': list
        });
        this.initSelectSpecGoods();
        this.checkCartNum(this.data.goodsInputNum);
    },

    /** 购买虚拟商品 */
    buyVirtualGoods: function (data) {
        Object.assign(data, {
            goods_name: this.data.data.goods.goods_name,
            spec_name: this.data.select.specName,
            price: this.data.select.price,
        });
        wx.navigateTo({ url: '/pages/virtual/buy_step/buy_step?' + util.Obj2Str(data) });
    },

    /** 加入购物车 */
    addCart: function (e) {
        var that = this;
        var itemId = 0;
        var specs = this.data.data.spec_goods_price;
        //区分有规格和无规格
        if (specs.length > 0) {
            if (specs[this.data.specSelect].store_count <= 0) {
                return app.showWarning("库存已为空！");
            }
            itemId = specs[this.data.specSelect].id;
        } else {
            if (this.data.data.goods.store_count <= 0) {
                return app.showWarning("库存已为空！");
            }
        }
        if (this.data.goodsInputNum <= 0) {
            return app.showWarning("商品数量不能为0");
        }
        var data = {
            goods_id: this.data.data.goods.goods_id,
            goods_num: this.data.goodsInputNum,
            item_id: itemId
        };
        if (this.data.data.goods.is_virtual > 0) {
            return this.buyVirtualGoods(data);
        }
        if (e.currentTarget.dataset.action == 'add') { //加入购物车
            if (this.data.select.stock <= 0) {
                return;
            }
            request.post('/api/cart/addCart', {
                data: data,
                success: function (res) {
                    console.log("/api/cart/addCart");
                    console.log(res);
                    wx.showModal({
                        title: '添加成功！',
                        cancelText: '去购物车',
                        confirmText: '再逛逛',
                        success: function (res) {
                            if (res.cancel) {
                                wx.switchTab({ url: '/pages/cart/cart/cart' });
                            } else {
                                that.requestCardNum();
                            }
                        }
                    });
                }
            });
        } else if (e.currentTarget.dataset.action == 'exchange') { //立即兑换
            this.exchange(data);
        } else { //立即购买
            this.buyNow(data);
        }
    },

    /** 立即兑换 */
    exchange: function (data) {
        if (this.data.select.stock <= 0) {
            return;
        }
        wx.navigateTo({ url: '/pages/cart/integral/integral?' + util.Obj2Str(data) });
    },

    /** 立即购买 */
    buyNow: function (data) {
        if (this.data.select.stock <= 0) {
            return;
        }
        Object.assign(data, {
            action: 'buy_now',
        });
        wx.navigateTo({ url: '/pages/cart/cart2/cart2?' + util.Obj2Str(data) });
    },

    /** 增加购买的商品数量 */
    addCartNum: function (e) {
        this.checkCartNum(this.data.goodsInputNum + 1);
    },

    /** 减少购买的商品数量 */
    subCartNum: function (e) {
        // const operation = e.currentTarget.dataset.operation;
        // this.setData({goodsInputNum: this.data.goodsInputNum + operation})
        this.checkCartNum(this.data.goodsInputNum - 1);
    },

    /** 输入购买的数量 */
    inputCartNum: function (e) {
        this.checkCartNum(Number(e.detail.value));
        // this.setData({goodsInputNum: e.detail.value});
    },

    /** 检查购买的数量 */
    checkCartNum: function (num) {
        var stock = this.data.data.goods.store_count;
        if (this.data.data.spec_goods_price.length > 0) {
            stock = this.data.data.spec_goods_price[this.data.specSelect].store_count;
        }
        if (num > stock || stock == 0) {
            num = stock;
        } else if (num < 1) {
            num = 1;
        }
        this.setData({ goodsInputNum: num });
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
        //this.setData({ openSpecModal: false });
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
        //this.setData({ openSpecModal: true });
    },
    /** 方法  收藏商品 */
    collectGoods: function () {
        var that = this;
        request.post('/api/goods/collectGoodsOrNo', {
            data: { goods_id: that.data.data.goods.goods_id },
            success: function (res) {
                that.setData({ 'data.goods.is_collect': !that.data.data.goods.is_collect });
            }
        });
    },

    /** 联系客服 */
    contactService: function () {
        app.confirmBox('请联系客服：' + this.data.data.store.store_phone);
    },

    /** 请求购物车数量 */
    requestCardNum: function () {
        var that = this;
        request.get('/api/cart/cartList', {
            success: function (res) {
                var cartGoodsNum = 0;
                var list = res.data.result.storeList;
                if (!list) {
                    return;
                }
                for (var i = 0; i < list.length; i++) {
                    for (var j = 0; j < list[i].cartList.length; j++) {
                        cartGoodsNum += list[i].cartList[j].goods_num;
                    }
                }
                that.setData({ cartGoodsNum: cartGoodsNum });
            }
        });
    },

    /** 预览图片 */
    previewCommentImgs: function (e) {
        var imgs = this.data.comments[e.currentTarget.dataset.cidx].img;
        wx.previewImage({
            current: imgs[e.currentTarget.dataset.id],
            urls: imgs
        });
    },

    /** 预览图片 */
    previewGoodsCommentImgs: function (e) {
        var that = this;
        var imgs = this.data.data.comment[e.currentTarget.dataset.cidx].img;
        imgs = imgs.map(function (val) {
            return that.data.url + val;
        });
        wx.previewImage({
            current: imgs[e.currentTarget.dataset.id],
            urls: imgs
        });
    },

    /** 关闭优惠信息弹窗 */
    closePromModal: function () {
        this.setData({ openPromModal: false });
    },

    /** 打开优惠信息弹窗 */
    openPromModal: function () {
        this.setData({ openPromModal: true });
    },

    /**
     * 转发按钮
     */
    onShareAppMessage: function (res) {
        return setting.share;
    }

});
