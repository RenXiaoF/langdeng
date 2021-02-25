// pages/user/login/login.js
var app = getApp();
var request = app.request;
var common = require('../../../utils/common.js');
var md5 = require('../../../utils/md5.js');

Page({
    data: {
        // type: 'register',
        typeAction: 'password',
        capacheUrl: '',
        mobile: '',
    },
    /**生命周期 */
    onLoad: function (options) {
        // this.setData({ type: options.type });
        this.setData({ typeAction: options.typeAction });
        wx.setNavigationBarTitle({
            // title: options.type == 'relate' ? '关联账号登录' : '注册账户',
        });
    },
    /**获得capache */
    getCapache: function () {
        this.setData({ capacheUrl: common.getCapache() });
    },
    /**获得验证码 */
    getCode: function (e) {
        common.sendSmsCode(this.data.mobile , 1);
    },
    /**设置电话号码 */
    setMobile: function (e) {
        this.data.mobile = e.detail.value;
    },
    /**提交表单 */
    submitForm: function (e) {
        var typeAction = this.data.typeAction;
        if (!typeAction) {
            return;
        }
        var values = e.detail.value;
        if (typeAction == 'mobile') {
            this.submitRelate(values);
        } else if (typeAction == 'password') {
            this.submitRegister(values);
        } else {
            app.confirmBox("处理类型出错:" + typeAction);
        }
    },
    /**提交关联信息 */
    submitRelate: function (values) {
        var that = this;
        values.password = md5('TPSHOP' + values.password);
        // request.post('/api/user/bind_account', {
        request.post('user/wechat_login', {
            data: values,
            success: function (res) {
                app.showSuccess('关联成功', function () {
                    that.goHome();
                });
                console.log("关联或注册",res);
            }
        });
    },
    /**提交注册 */
    submitRegister: function (values) {
        if (values.password == '' || values.password_confirm == '' || values.mobile == '' || values.code == '') {
            return app.showWarning("请先填写完表单信息");
        }
        if (values.password != values.password_confirm) {
            return app.showWarning("新密码两次输入不一致");
        }
        var that = this;
        Object.assign(values, { is_bind: 1 });
        request.post('/api/user/reg', {
            data: values,
            success: function (res) {
                app.showSuccess('注册成功', function () {
                    that.goHome();
                });
            }
        });
    },

    goHome: function () {
        wx.switchTab({ url: '/pages/index/index/index' });
    }

})