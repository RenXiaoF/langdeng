var app = getApp();
var pay = require('../../../utils/pay.js');

Page({
    data: {
        userMoney: 0,
    },

    onLoad: function (options) {
        this.setData({ userMoney: options.money });
    },

    /** 提交充值 */
    submitRechange: function (e) {
        var money = parseFloat(e.detail.value.money);
        console.log(money);
        if (isNaN(money) || money < 0.01) {
            return app.showWarning('请输入有效的金额');
        }
        pay.rechange(money, function () {
            wx.navigateBack();
        });
    },

});