// account.js
var app = getApp();

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        userMoney: 0
    },

    onShow: function () {
        var that = this;
        app.getUserInfo(function (userInfo) {
            that.setData({
                userMoney: userInfo.user_money
            });
        });
    }

})