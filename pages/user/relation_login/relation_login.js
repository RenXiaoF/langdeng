var app = getApp();
var request = app.request;
var setting = require('../../../setting.js');
var common = require('../../../utils/common.js');
var md5 = require('../../../utils/md5.js');

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        // worker: {
        //     username: '15555555555',
        //     password: '111222',
        //     // code: '',
        //     // token: '',
        //     typeAction: 'password',
        // },
        globalData: {
            setting: setting,   //用户可配置项
            wechatUser: null,   //微信的用户信息
            userInfo: null,     //商城的用户信息
            config: null,       //app系统配置
        }
    },
    /**生命周期 */
    onLoad: function (options) {

    },


    /**登录 */
    submitRelate: function (values) {
        var that = this;
        // values.password = md5('TPSHOP' + values.password);
        console.log("登录",values);
        request.post('User/do_login', {
            data:{
                username: values.detail.value.username,
                password: values.detail.value.password,
                typeAction: 'password'
            },
            success: function (res) {
                console.log("登录", res);
                app.globalData.userInfo = res.data.result;
                app.globalData.userInfo.head_pic = common.getFullUrl(that.data.globalData.head_pic);
                app.showSuccess('登录成功', function () {
                    that.goHome();
                });

            }
        });
    },
    /**跳转到首页 */
    goHome: function () {
        wx.switchTab({ url: '/pages/index/index/index' });
    },
    /**跳转到快速登录，手机号：验证码 */
    goQuickLogin:function(){
        wx.navigateTo({  url: '/pages/user/quick_login/quick_login' }); 
    },
      /**跳转：绑定手机 */
      goSignup:function(){
        wx.navigateTo({  url: '/pages/user/signup/signup' }); 
    }

})