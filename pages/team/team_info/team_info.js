var util = require('../../../utils/util.js');
var common = require('../../../utils/common.js');
var WxParse = require('../../../utils/wxParse/wxParse.js');
var app = getApp();
var request = app.request;
var setting = app.globalData.setting;

Page({
    data: {
        url: setting.url,
        resourceUrl: setting.resourceUrl,
        defaultAvatar: setting.resourceUrl + "/static/images/user68.jpg",
        result: null,
        content: '', //商品详情页html
        goodsAttrs: null, //商品属性列表
        specSelect: 0, //选中的组合规格数组spec_goods_price下标
        optiongoodId: 0,
        optionItemId: 0, //页面参数，页面初始化指定显示的itemid，用于活动
        goodsInputNum: 1, //选中的商品件数
        openSpecModal: false, //是否打开规格弹窗
        activeCategoryId: 0, //商品主页tab
        supportPageScroll: false, //微信版本是否支持页面滚动回顶部
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
        comments: null,
        categories3: [
            { name: "全部评价", id: 0, num: 0 },
            { name: "好评", id: 1, num: 0 },
            { name: "中评", id: 2, num: 0 },
            { name: "差评", id: 3, num: 0 },
            { name: "有图", id: 4, num: 0 }
        ],
        goods: null,
        store: null,
        team: null,
        teamResult: {
            server_time: 0,
            teamFounds: null,
        },
        timer: null,
        select: { //选择的(规格)商品的参数，用于显示
            teamId: 0,
            teamPrice: 0,
            needer: 0,
            price: 0,
            stock: 0,
            statusDesc: '',
            shareDesc: '',
        },
        rule: true,
    },

    onLoad: function (options) {
        var that = this;
        var goodId = typeof options.goods_id == 'undefined' ? 0 : options.goods_id;
        var itemId = typeof options.item_id == 'undefined' ? 0 : options.item_id;
        this.setData({
            optiongoodId: goodId,
            optionItemId: itemId,
        });
        this.getTeamList();
        request.get('/api/Team/info', {
            data: { 
                goods_id: goodId,
                team_id: itemId,
            },
            failRollback: true,
            success: function (res) {
                var result = res.data.result;
                that.setData({ goods: result.goods });
                that.setData({ store: result.store });
                that.setData({ team: result.team });
                //初始化评论
                that.initComment();
                //初始化规格
                that.initSpecsPrice(result);
                that.setData({ result: result });
                that.requestGoodsContent();
            }
        });
        //是否支持返回按钮
        if (wx.pageScrollTo) {
            this.setData({ supportPageScroll: true });
        }
    },

    /** 获取拼团列表 */
    getTeamList: function(){
        var that = this;
        request.post('/api/Team/ajaxTeamFound', {
            data: {
                goods_id: that.data.optiongoodId,
            },
            failRollback: true,
            success: function (res) {
                var result = res.data.result;
                that.setData({ 
                    'teamResult.server_time': result.server_time,
                    'teamResult.teamFounds': result.teamFounds,
                });
                that.createTimer();
            }
        });
    },

    createTimer: function () {
        var that = this;
        var startTime = (new Date()).getTime();
        this.data.timer = setInterval(function () {
            if (that.data.teamResult.teamFounds.length <= 0) {
                return;
            }
            var teamFounds = that.data.teamResult.teamFounds;
            for (var i = 0; i < teamFounds.length; i++) {
                var diffTime = startTime - that.data.teamResult.server_time * 1000;
                teamFounds[i].remainTime = util.transTime((teamFounds[i].found_time + teamFounds[i].time_limit) * 1000 - (new Date()).getTime() + diffTime);
                if (teamFounds[i].remainTime.hour <= 0 && teamFounds[i].remainTime.minute <= 0 && teamFounds[i].remainTime.second <= 0){
                    clearInterval(that.data.timer);
                    that.getTeamList();
                }
            }
            that.setData({ 'teamResult.teamFounds': teamFounds });
        }, 1000);
    },

    onUnload: function () {
        clearInterval(this.data.timer);
    },

    /** 初始化评论相关 */
    initComment: function () {
        //评论数
        this.data.categories3[0].num = this.data.goods.comment_statistics.total_sum;
        this.data.categories3[1].num = this.data.goods.comment_statistics.high_sum;
        this.data.categories3[2].num = this.data.goods.comment_statistics.center_sum;
        this.data.categories3[3].num = this.data.goods.comment_statistics.low_sum;
        this.data.categories3[4].num = this.data.goods.comment_statistics.img_sum;
        //渲染视图
        this.setData({ categories3: this.data.categories3 });
    },

    /** 初始化所有规格 */
    initSpecsPrice: function (result) {
        var specSelect = 0; //初始化选中第一个规格
        var specs = result.spec_goods_price;
        if (specs.length == 0) { //没有规格
            this.setData({
                'select.teamId': this.data.team.team_id,
                'select.teamPrice': this.data.team.team_price,
                'select.price': this.data.team.price ? this.data.team.price : this.data.goods.shop_price,
                'select.stock': this.data.team.store_count ? this.data.team.store_count : this.data.goods.store_count,
                'select.needer': this.data.team.needer,
                'select.statusDesc': this.data.team.front_status_desc,
                'select.shareDesc': this.data.team.share_desc,
            });
            return;
        }
        if (this.data.optionItemId) { //指定规格
            for (var i = 0; i < specs.length; i++) {
                if (specs[i].item_id == this.data.optionItemId) {
                    specSelect = i;
                    break;
                }
            }
        }
        //生成子规格组(filter_spec)的各自选中项
        var specIds = specs[specSelect].key.split("_");
        var list = result.filter_spec;
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
            'result.filter_spec': list,
            'result.spec_goods_price': specs,
            'select.teamId': specs[specSelect].team_id,
            'select.teamPrice': specs[specSelect].team_price,
            'select.price': specs[specSelect].price,
            'select.stock': specs[specSelect].store_count,
            'select.needer': specs[specSelect].needer,
            'select.statusDesc': specs[specSelect].front_status_desc,
            'select.shareDesc': specs[specSelect].share_desc,
        });
    },

    /** 联系客服 */
    contactService: function () {
        if (this.data.store.service_phone){
            app.confirmBox('请联系客服：' + this.data.store.service_phone);
        }else{
            app.confirmBox('暂无联系方式');
        }
    },

    collectGoods: function () {
        var that = this;
        request.post('/api/goods/collectGoodsOrNo', {
            data: { goods_id: that.data.goods.goods_id },
            success: function (res) {
                that.setData({ 'result.collect': !that.data.result.collect });
            }
        });
    },

    showRule:function(){
        this.setData({ rule: !this.data.rule });
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
        this.requestComments(this.data.goods.goods_id, e.currentTarget.id);
    },

    /** 请求评论数据 */
    requestComments: function (goodsId, commentType) {
        var that = this;
        commentType++;
        var requestUrl = that.data.url + '/api/goods/getGoodsComment?goods_id=' + goodsId + '&type=' + commentType;
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
            this.requestComments(this.data.goods.goods_id, this.data.activeCategoryId3);
        }
    },

    /** 打开商品内容页 */
    tabGoodsContent: function () {
        this.setData({ activeCategoryId: 1 });
    },

    /** 请求商品详情页嵌入的html内容 */
    requestGoodsContent: function () {
        var that = this;
        request.get('/api/goods/goodsContent', {
            data: { id: this.data.goods.goods_id },
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
        var list = this.data.result.filter_spec;
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
        var specs = this.data.result.spec_goods_price;
        for (var i = 0; i < specs.length; i++) {
            if (specs[i].key == newSpecKeys) {
                newSpecSelect = i;
                break;
            }
        }
        this.setData({
            specSelect: newSpecSelect,
            'result.filter_spec': list,
            'result.spec_goods_price': specs,
            'select.teamId': specs[newSpecSelect].team_id,
            'select.teamPrice': specs[newSpecSelect].team_id>0? specs[newSpecSelect].team_price:'',
            'select.price': specs[newSpecSelect].price,
            'select.stock': specs[newSpecSelect].store_count,
            'select.needer': specs[newSpecSelect].team_id > 0 ? specs[newSpecSelect].needer:'',
            'select.statusDesc': specs[newSpecSelect].team_id > 0 ? specs[newSpecSelect].front_status_desc:'',
            'select.shareDesc': specs[newSpecSelect].team_id > 0 ? specs[newSpecSelect].share_desc:'',
        });
        this.checkCartNum(this.data.goodsInputNum);
    },

    /** 单独购买 */
    buyNormal: function(){
        var parmas={
            goods_id: this.data.goods.goods_id,
            item_id: this.data.optionItemId,
        };
        wx.navigateTo({ url: '/pages/goods/goodsInfo/goodsInfo?' + util.Obj2Str(parmas) });
    },

    /** 拼团立即购买 */
    buyNow: function(){
        var that = this;
        if (that.data.select.teamId <= 0){
            return;
        }
        request.post('/api/Team/addOrder', {
            data: { 
                team_id: that.data.select.teamId,
                goods_num: that.data.goodsInputNum,
            },
            success: function (res) {
                wx.navigateTo({ url: '/pages/team/team_confirm/team_confirm?orderSn=' + res.data.result.order_sn });
            }
        });
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
        var stock = this.data.goods.store_count;
        if (this.data.result.spec_goods_price.length > 0) {
            stock = this.data.result.spec_goods_price[this.data.specSelect].store_count;
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
        this.setData({ openSpecModal: false });
    },

    /** 打开规格弹窗 */
    openSpecModel: function () {
        this.setData({ openSpecModal: true });
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

    onShareAppMessage: function (res) {
        return setting.share;
    }

});

