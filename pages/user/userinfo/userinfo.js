var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var common = require("../../../utils/common.js");

Page({
    data: {
        url: setting.url,
        resourceUrl: setting.resourceUrl,
        defaultAvatar: setting.resourceUrl + "/static/images/user68.jpg",
        user: null
    },

    onShow: function () {
        var that = this;
        app.getUserInfo(function (userInfo) {
            that.setData({
                user: userInfo
            });
        }, true);
    },

    editUserInfo: function (e) {
        var type = e.currentTarget.dataset.type;
        if ((type == 'password' || type == 'paypwd') && !this.data.user.mobile) {
            return app.showWarning('请先绑定手机号码');
        }
        if (type && this.data.user) {
            wx.navigateTo({
                url: `/pages/user/userinfo_edit/userinfo_edit?type=${type}`,
            });
        }
    },

    changeAvatar: function () {
        var that =this;
        wx.chooseImage({
            count: 1, //最多1张图片,默认9
            sizeType: ['compressed', 'original'], //可以指定是原图还是压缩图，默认二者都有
            sourceType: ['camera', 'album'], //可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                request.uploadFile(that.data.url + '/api/user/upload_headpic', {
                    filePath: res.tempFilePaths[0],
                    name: 'head_pic',
                    success: function (res) {
                        var headPic = common.getFullUrl(res.data.result);
                        that.setData({
                            ['user.head_pic']: headPic
                        });
                        app.globalData.userInfo.head_pic = headPic;
                        app.showSuccess("设置头像成功");
                    }
                });
            }
        });
    },

     /** 清除授权 */
     clearAuth: function () {
        app.request.post('/api/user/logout', {
            isShowLoading: false,
            data: { token: app.request.getToken() },
            failStatus: function () {
                return false;
            }
        });
    },

})