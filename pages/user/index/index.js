var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
Page({
    data: {
        url: setting.url,
        resourceUrl: setting.resourceUrl,
        defaultAvatar: setting.resourceUrl + "/static/images/user68.jpg",
        userInfo: {
            collect_count: 0,
            message_count: 0,
            waitPay: 0,
            waitSend: 0,
            waitReceive: 0,
            uncomment_count: 0,
            return_count: 0,
            user_money: 0,
            coupon_count: 0,
            pay_points: 0,
            phone: ''
        },
        cost: null, // 用户基本信息
        // 获得公司的名字 电话号码
        gongsi: null,
        gongsiphone: 0,

    },

    onShow: function () {
        //先预设值，加速加载
        if (app.globalData.userInfo) {
            this.setData({ userInfo: app.globalData.userInfo });
        }

        // 是否授权(微信)
        if (!app.auth.isAuth()) {
            app.showLoading(null, 1500);
        }

        // 获取微信用户信息（微信授权）
        var that = this;
        app.getUserInfo(function (userInfo) {
            that.setData({ userInfo: userInfo });
            // 用户基本信息
            that.getMyBaseInfo();
            // 获得公司的名字 电话
            that.get_gongsiany();
        }, true, false);
    },

    /**用户基本信息 */
    getMyBaseInfo: function () {
        var that = this;
        var requestUrl = 'Consumer/get_my_money_address';
        request.get(requestUrl, {
            success: function (res) {
                console.log("用户基本信息", res.data.re);
                that.setData({ cost: res.data.re })
            }
        })
    },

    /**获得公司的名字 电话号码 */
    get_gongsiany: function () {
        var that = this;
        var requestUrl = 'index/getgongsiany';
        request.get(requestUrl, {
            success: function (res) {
                console.log("获得公司的名字 电话号码",res);
                that.setData({
                    gongsi: res.data,
                    gongsiphone: res.data.phone
                })
            }
        })
    },

    /**
   *拨打客服电话
   */
    call: function () {
        var that = this;
        console.log(app.globalData);
        wx.showModal({
            title: '提示',
            content: '是否拨打客服电话?',
            success: function (res) {
                if (res.confirm) {
                    wx.makePhoneCall({
                        // phoneNumber: app.globalData.userInfo.phone,
                        // phoneNumber: that.data.gongsiphone,
                        phoneNumber: 17724185007,
                    })
                } else if (res.cancel) {
                    console.log('no');
                }
            }
        })
    },
});