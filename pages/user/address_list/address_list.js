var app = getApp();
var request = require('../../../utils/request.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        addresses: null, //请求的地址列表
        operate: null, //操作类型，select：订单选择地址操作，其他：普通展示
    },

    onLoad: function (options) {
        this.data.operate = options.operate;
    },

    onShow: function () {
        this.requestAddressList();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.requestAddressList();
    },

    /** 请求地址列表数据 */
    requestAddressList: function () {
        var that = this;
        request.get('Cart/ajaxAddress', {
            success: function (res) {
                that.setData({ addresses: res.data.result.address_list });
                wx.stopPullDownRefresh();
            }
        });
    },

    /** 修改地址 */
    editAddress: function (e) {
        var address = this.getAddressData(e.currentTarget.dataset.id);
        var params = '';
        for (var item in address) {
            params += (params.length != 0 ? '&' : '?') + (item + '=' + address[item]);
        }
        params && wx.navigateTo({ url: "/pages/user/add_address/add_address" + params });
    },

    /** 填写订单(商品详情)的时候可触发选择地址 */
    selectAddress: function (e) {
        if (this.data.operate == 'select') {
            //更新订单页的地址
            wx.setStorageSync('cart:cart2:address_id', e.currentTarget.dataset.item.address_id);
            wx.navigateBack();
        } else if (this.data.operate == 'teamSelect'){
            //更新拼团订单页的地址
            wx.setStorageSync('team:confirm:address_id', e.currentTarget.dataset.item.address_id);
            wx.navigateBack();
        } else if (this.data.operate == 'selectAddress'){
            //更新商品详情的配送地
            var totalAddress = e.currentTarget.dataset.item.province_name + e.currentTarget.dataset.item.city_name + e.currentTarget.dataset.item.district_name;
            var address={
                address: totalAddress,
                district: e.currentTarget.dataset.item.district,
            };
            wx.setStorageSync('goodsInfo:goodsInfo:address', address);
            wx.navigateBack();
        }
    },

    /** 由addressId获取地址数据 */
    getAddressData: function (addressId) {
        var addresses = this.data.addresses;
        for (var idx in addresses) {
            if (addresses[idx].address_id == addressId) {
                break;
            }
        }
        if (!idx) {
            return {};
        }
        return addresses[idx];
    }

})