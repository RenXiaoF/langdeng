var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var select = require('../../../utils/selectFiles.js');

Page({
    data: {
        url: setting.url,
        defaultPhoto: setting.resourceUrl + '/static/images/camera.png',
        filePath: '', //本地图片的路径
        uploadPath: '', //上传图片的路径
        isLongValid: false,
        startDate: '',
        endDate: '',
        form: {},
    },
    
    /** 选择照片 */
    selectPhotos: function (e) {
        var that = this;
        wx.chooseImage({
            count: 1, //最多1张图片
            sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
            sourceType: ['camera', 'album'], //可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                that.setData({ filePath: res.tempFilePaths[0] });
            }
        });
    },

    /** 上传图片 */
    uploadPhotos: function (call, pathIdx) {
        if (!this.data.filePath) {
            return app.showWarning('请上传营业执照');
        }
        var that = this;
        request.uploadFile('/api/newjoin/uploadBusinessCertificate', {
            filePath: that.data.filePath,
            name: 'business_licence_cert',
            success: function (res) {
                that.data.uploadPath = res.data.result;
                that.submitData();
            }
        });
    },

    submitInfo: function (e) {
        var data = e.detail.value;
        if (!data.business_licence_number || !data.legal_person 
            || !(this.data.isLongValid || (!this.data.isLongValid && this.data.startDate && this.data.endDate))) {
            return app.showWarning('请先填完信息'); 
        }
        this.data.form = data;
        this.uploadPhotos();
    },

    submitData: function () {
        var that = this;
        request.post('/api/newjoin/remark', {
            data: Object.assign({}, this.data.form, {
                business_date_start: this.data.startDate,
                business_date_end: this.data.endDate,
                business_permanent: this.data.isLongValid ? 1 : 0,
                business_img: that.data.uploadPath,
            }),
            success: function (res) {
                wx.redirectTo({ url: '/pages/newjoin/join4/join4' });
            }
        });
    },

    setLongValid: function (e) {
        this.setData({ isLongValid: e.detail.value });
    },

    bindStartDate: function (e) {
        this.setData({ startDate: e.detail.value });
    },

    bindEndDate: function (e) {
        this.setData({ endDate: e.detail.value });
    },

})