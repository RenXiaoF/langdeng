var app = getApp();
var request = app.request;
var setting = app.globalData.setting;
import Regions from '../../../utils/regions/Regions.js';

Page({
    data: {
        url: setting.url, 
        address: {}, //地址信息
        isAgree: true,
        showPage: false,
    },

    onLoad: function (options) {
        if (options.status==2){
            this.setData({ showPage: true });
        }else{
            this.getApplyInfo();
        }
        this.initRegions();
    },

    /** 初始化区域弹框相关 */
    initRegions: function () {
        var that = this;
        new Regions(this, 'regions', {
            endAreaLevel: 3,
            endAreaLevelCall: function (parentId, regionName, address) {
                that.setData({ address: address });
            }
        });
    },

    getApplyInfo: function () {
        var that = this;
        request.get('/api/newjoin/getApply', {
            fallRollBack: true,
            success: function (res) {
                var step = res.data.result.status;
                if (step > 1 && step <= 3) {
                    wx.redirectTo({ url: '/pages/newjoin/join' + step + '/join' + step });
                } else if(step == 4) {
                    wx.redirectTo({ url: '/pages/newjoin/join4/join4?status=' + res.data.result.apply_state });
                } else {
                    that.setData({ showPage: true });
                }
            }
        });
    },

    submitInfo: function (e) {
        if (!this.data.isAgree) {
            return app.showWarning('请先同意协议');
        }
        var data = e.detail.value;
        var address = this.data.address;
        if (!address.province || !address.city || !address.district || !data.contacts_name || !data.contacts_mobile || !data.company_address) {
            return app.showWarning('请先填完信息');
        }
        Object.assign(data, {
            company_province: address.province,
            company_city: address.city,
            company_district: address.district,
        });
        request.post('/api/newjoin/basicInfo', {
            data: data,
            success: function (res) {
                wx.redirectTo({ url: '/pages/newjoin/join2/join2' });
            }
        });
    },

    setAgree: function (e) {
        this.data.isAgree = e.detail.value;
    }

})