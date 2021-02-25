var app = getApp()

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        order: null
    },

    onLoad: function (param) {
        this.setData({ order: param });
    },

    lookOrder: function(){
        if (this.data.order.is_group){
            wx.redirectTo({
                url: '/pages/team/team_order/team_order?type=0'
            });
        }else{
            wx.redirectTo({
                url: '/pages/user/order_list/order_list?type=0'
            });
        }
    }

})