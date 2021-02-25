var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var md5 = require('../../../utils/md5.js');
var common = require('../../../utils/common.js');
import Regions from '../../../utils/regions/Regions.js';

Page({
    data: {
        url: setting.url,
        resourceUrl: setting.resourceUrl,
        user: null,
        type: 'nickname',
        address: {}, // 收货地址
    },

    onLoad: function (options) {
        var that = this;
        // 收货地址
        that.setData({ address: options });
        // 设置导航栏
        this.setBarTitle(options.type);
        this.data.type = options.type;

        // getuserinfo
        app.getUserInfo(function (userInfo) {
            that.setData({
                user: userInfo,
            });
        });
        // 初始化区域弹框相关
        this.initRegions();
        // 更新个人信息
        // this.requestUpdateUser();
    },

    /** 初始化区域弹框相关 */
    initRegions: function () {
        var that = this;
        new Regions(this, 'regions', {
            endAreaLevelCall: function (parentId, regionName, address) {
                Object.assign(that.data.address, address);
                that.setData({
                    'address.province_name': that.data.address.province_name,
                    'address.city_name': that.data.address.city_name,
                    'address.district_name': that.data.address.district_name,
                    'address.twon_name': that.data.address.twon_name,
                });
            }
        });
    },


    /**更新个人信息 */
    requestUpdateUse: function (e) {
        var address = this.data.address;
        Object.assign(address, e.detail.value);
        request.post('Consumer/update_me', {
            data: address,
            success: function (res) {
                app.showSuccess(res.data.mas, function(){
                    wx.navigateBack();
                });
            }
        });
    },

    /** 设置表头 */
    setBarTitle: function (type) {
        var title = '修改个人信息';
        if (type == 'nickname') {
            title = '修改昵称';
        } else if (type == 'mobile') {
            title = '修改手机';
        } else if (type == 'email') {
            title = '修改邮箱';
        } else if (type == 'password') {
            title = '修改密码';
        } else if (type == 'paypwd') {
            title = '修改支付密码';
        } else if (type == 'sex') {
            title = '修改性别';
        }
        wx.setNavigationBarTitle({ title: title });
    },

    /** 表单提交 */
    requestUpdateUserInfo: function (e) {
        var type = this.data.type;
        if (!type) {
            return;
        }
        console.log(e.detail.value);//debugger;
        var values = e.detail.value;
        if (type == 'nickname') {
            this.submitNickname(values);
        } else if (type == 'mobile') {
            this.submitMobile(values);
        } else if (type == 'email') {
            this.submitEmail(values);
        } else if (type == 'password') {
            this.submitPassword(values);
        } else if (type == 'paypwd') {
            this.submitPaypwd(values);
        } else if (type == 'sex') {
            this.submitSex(values);
        } else {
            app.confirmBox("处理类型出错:" + type);
        }
    },

    submitNickname: function (values) {
        if (!values.nickname) {
            app.showWarning("昵称不能为空！");
            return false;
        }
        this.requestUpdateUser({
            nickname: values.nickname
        });
    },

    submitMobile: function (values) {
        if (!(values.mobile && values.mobile_code)) {
            app.showWarning("输入不能为空！");
            return false;
        }
        this.requestUpdateUser({
            mobile: values.mobile,
            mobile_code: values.mobile_code,
            scene: 6,
        });
    },

    submitEmail: function (values) {
        if (values.email.indexOf('@') < 0) {
            app.showWarning("邮箱格式不正确");
            return false;
        }
        this.requestUpdateUser({
            email: values.email
        });
    },

    submitPassword: function (values) {
        var hasPw = this.data.user.password;
        if (!((!hasPw || (hasPw && values.old_password)) && values.new_password && values.confirm_password)) {
            app.showWarning("输入不能为空！");
            return false;
        }
        if (values.new_password !== values.confirm_password) {
            app.showWarning("新密码两次输入不一致");
            return false;
        }
        if (values.new_password.length < 6) {
            app.showWarning("密码长度不能小于6位");
            return false;
        }
        this.requestUpdateUser({
            old_password: md5('TPSHOP' + values.old_password),
            new_password: md5('TPSHOP' + values.new_password)
        });
    },

    submitPaypwd: function (values) {
        if (!(values.paypwd_mobile && values.paypwd_code && values.paypwd && values.paypwd_confirm)) {
            app.showWarning("输入不能为空！");
            return false;
        }
        if (values.paypwd !== values.paypwd_confirm) {
            app.showWarning("新密码两次输入不一致");
            return false;
        }
        if (values.paypwd.length < 6) {
            app.showWarning("密码长度不能小于6位");
            return false;
        }

        this.requestUpdateUser({
            paypwd: md5('TPSHOP' + values.paypwd),
            mobile: values.paypwd_mobile,
            mobile_code: values.paypwd_code
        });
    },

    submitSex: function (values) {
        if (this.data.user.sex == 0) {
            app.showWarning("请先选择性别");
            return false;
        }
        this.requestUpdateUser({
            sex: this.data.user.sex
        });
    },

    changeGender: function (e) {
        var gender = e.currentTarget.dataset.gender;
        var sexNum = (gender == 'boy') ? 1 : 2;
        this.setData({ 'user.sex': sexNum });
    },

    requestUpdateUser: function (data) {
        request.post('user/updateUserInfo', {
            data: data,
            success: function (res) {
                wx.navigateBack();
            }
        });
    },

    setMobile: function (e) {
        this.data.user.mobile = e.detail.value;
    },

    getCode: function (e) {
        common.sendSmsCode(this.data.user.mobile);
    }

})
