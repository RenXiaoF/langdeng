var app = getApp();
var request = app.request;

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        carts: null,
        checkAllToggle: false, //全选标志
    },
    
    /** 返回的时候刷新 */
    onShow: function () {
        this.getCardList();
    },

    /** 删除一商品 */
    deleteItem:function (e) {
        var that = this;
        wx.showModal({
            title: '确定删除',
            success: function (res) {
                if (!res.confirm) {
                    return;
                }
                var sidx = e.currentTarget.dataset.sidx;
                var cidx = e.currentTarget.dataset.cidx;
                var id = that.data.carts.storeList[sidx].cartList[cidx].id;
                request.post('/api/cart/delCart?ids=' + id, {
                    success: function (res) {
                        that.getCardList();
                    }
                });
            }
        })
    },

    /** 输入购买数量 */
    valueToNum:function (e) {
        var goodsNum;
        var sidx = e.currentTarget.dataset.sidx;
        var cidx = e.currentTarget.dataset.cidx;
        var cart = this.data.carts.storeList[sidx].cartList[cidx];
        if (isNaN(e.detail.value) || e.detail.value < 1){
            goodsNum = 1;
        } else {
            goodsNum = parseInt(e.detail.value);
        }
        if (goodsNum > cart.store_count) {
            goodsNum = cart.store_count;
        }
        if (cart.goods_num == goodsNum) {
            return;
        }
        var postData = JSON.stringify([{
            goodsNum: goodsNum,
            selected: cart.selected,
            cartID: cart.id,
        }]);
        this.postCardList(postData);
    },

    /** 数量加1 */
    addNum:function (e) {
        var sidx = e.currentTarget.dataset.sidx;
        var cidx = e.currentTarget.dataset.cidx;
        var cart = this.data.carts.storeList[sidx].cartList[cidx];
        if (cart.goods_num >= cart.store_count) {
            return;
        }
        var postData = JSON.stringify([{
          goodsNum: parseInt(cart.goods_num) + 1,
            selected: cart.selected,
            cartID: cart.id,
        }]);
        this.postCardList(postData);
    },

    /** 数量减1 */
    subNum:function (e) {
        var sidx = e.currentTarget.dataset.sidx;
        var cidx = e.currentTarget.dataset.cidx;
        var cart = this.data.carts.storeList[sidx].cartList[cidx];
        if (cart.goods_num == 1) {
            return;
        }
        var postData = JSON.stringify([{
          goodsNum: parseInt(cart.goods_num) - 1,
            selected: cart.selected,
            cartID: cart.id,
        }]);
        this.postCardList(postData);
    },

    /** 选择所有商品 */
    selectAll:function(){
        var checkAll = !this.data.checkAllToggle;
        var postCardList = [];
        var storeList = this.data.carts.storeList;
        for (var i = 0; i < storeList.length; i++) {
            for (var j = 0; j < storeList[i].cartList.length; j++){
                postCardList.push({
                    goodsNum: storeList[i].cartList[j].goods_num,
                    selected: checkAll,
                    cartID: storeList[i].cartList[j].id,
                })
            }
        }
        var postData = JSON.stringify(postCardList);
        this.postCardList(postData);
    },

    /** 选择单一商品 */
    selectGoods: function (e) {
        var sidx = e.currentTarget.dataset.sidx;
        var cidx = e.currentTarget.dataset.cidx;
        var cart = this.data.carts.storeList[sidx].cartList[cidx];
        var postData = JSON.stringify([{
            goodsNum: cart.goods_num,
            selected: Number(!cart.selected),
            cartID: cart.id,
        }]);
        this.postCardList(postData);
    },

    /** 选择一店铺下所有商品 */
    selectStore: function (e) {
        var sidx = e.currentTarget.dataset.sidx;
        var store = this.data.carts.storeList[sidx];
        var postData = [];
        for (var i = 0; i < store.cartList.length; i++) {
            postData.push({
                goodsNum: store.cartList[i].goods_num,
                selected: Number(!store.selected),
                cartID: store.cartList[i].id,
            });
        }
        this.postCardList(JSON.stringify(postData));
    },

    /** 对获取的数据进行选择检查 */
    doCheckAll: function (data) {
        var storeList = data.storeList;
        if (!storeList || !storeList.length) {
            this.setData({
                carts: null,
                checkAllToggle: false
            });
            return;
        }
        var checkAllToggle = true;
        for (var i = 0; i < storeList.length; i++) {
            storeList[i].selected = true;
            for (var j = 0; j < storeList[i].cartList.length; j++) {
                if (!storeList[i].cartList[j].selected) {
                    storeList[i].selected = false;
                    checkAllToggle = false;
                    break;
                }
            };
        }
        this.setData({ 
            carts: data,
            checkAllToggle: checkAllToggle 
        });
    },

    /** 提交购物车数据 */
    postCardList: function (postData) {
        var that = this;
        request.post('/api/cart/cartList', {
            data: { cart_form_data: postData },
            success: function (res) {
                that.doCheckAll(res.data.result);
            }
        });
    },

    /** 获取购物车列表 */
    getCardList: function () {
        var that = this;
        request.get('/api/cart/cartList', {
            success: function (res) {
                that.doCheckAll(res.data.result);
                wx.stopPullDownRefresh();
            }
        });
    },

    onPullDownRefresh: function (e) {
        this.getCardList();
    },

    /** 去结算 */
    checkout: function () {
        var hasAnySelected = false;
        var storeList = this.data.carts.storeList;
        for (var i = 0; i < storeList.length; i++) {
            for (var j = 0; j < storeList[i].cartList.length; j++) {
                if (storeList[i].cartList[j].selected) {
                    hasAnySelected = true;
                    break;
                }
            }
        }
        if (!hasAnySelected) {
            app.showWarning('还没有选中商品');
            return;
        }
        wx.navigateTo({ url: '/pages/cart/cart2/cart2' });
    }

});