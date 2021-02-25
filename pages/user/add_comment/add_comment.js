// add_comment.js
var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var util = require('../../../utils/util.js');
var select = require('../../../utils/selectFiles.js');

Page({
    data: {
        url: setting.url,
        resourceUrl: setting.resourceUrl,
        defaultPhoto: setting.resourceUrl + '/static/images/camera.png',
        filePaths: [], //本地图片的路径
        uploadPath: [], //上传图片的路径
        maxWord:0,
        is_anonymous: false,
        goods_rank:0,
        service_rank:0,
        deliver_rank:0,
        goods_score:0,
        content: '',
        options: null,
        isLongPress: false, //是否进行长按图片操作,解决有些手机上短按和长按同时触发的问题
    },

    onLoad: function (options) {
        this.setData({ options: options });
    },

    keyUpChangeNum: function(e) {
        this.setData({ maxWord: e.detail.value.length });
        this.data.content = e.detail.value;
    },

    checkAnonymous: function() {
        this.setData({ is_anonymous:!this.data.is_anonymous });
    },

    checkGoodsRank: function(e) {
        this.setData({ goods_rank: parseInt(e.currentTarget.dataset.i) + 1 });
    },

    checkServiceRank: function (e) {
        this.setData({ service_rank: parseInt(e.currentTarget.dataset.i) + 1 });
    },

    checkDeliverRank: function (e) {
        this.setData({ deliver_rank: parseInt(e.currentTarget.dataset.i) + 1 });
    },

    checkGoodsScore: function (e) {
        this.setData({ goods_score: parseInt(e.currentTarget.dataset.i) + 1 });
    },

    /** 选择照片 */
    selectPhotos: function (e) {
        if (this.data.isLongPress) {
            this.data.isLongPress = false;
            return;
        }
        var that = this;
        select.selectPhotos(this.data.filePaths, e.currentTarget.dataset.idx, function (filePaths) {
            that.setData({ filePaths: filePaths });
        });
    },

    /** 删除单张图片 */
    removePhoto: function(e) {
        var that = this;
        this.data.isLongPress = true;
        select.removePhoto(this.data.filePaths, e.currentTarget.dataset.idx, function (filePaths) {
            that.setData({ filePaths: filePaths });
        });
    },

    /** 提交评论 */
    submitComment: function () {
        var that = this;
        if (that.data.content==''){
            return app.showWarning("请填写评论");
        }
        if (!that.data.service_rank || !that.data.goods_rank || !that.data.deliver_rank || !that.data.goods_score) {
            return app.showWarning("请先打完分~");
        }
        this.uploadPhotos(function () {
            request.post('/api/user/add_comment', {
                data: Object.assign({
                    is_anonymous: that.data.is_anonymous ? 1 : 0,
                    goods_rank: that.data.goods_rank,
                    service_rank: that.data.service_rank,
                    deliver_rank: that.data.deliver_rank,
                    goods_score: that.data.goods_score,
                    content: that.data.content,
                    goods_id: that.data.options.goods_id,
                    order_id: that.data.options.order_id,
                    rec_id: that.data.options.rec_id
                }, util.convertRequestArray('img', that.data.uploadPath)),
                success: function (res) {
                    wx.setStorageSync('user:comment:update', true);
                    app.showSuccess('评论成功', function() {
                        wx.navigateBack();
                    });
                }
            });
        });
    },

    /** 上传图片 */
    uploadPhotos: function (call, pathIdx) {
        if (this.data.filePaths.length == 0) {
            return call();
        }
        if (typeof pathIdx != 'number') {
            pathIdx = 0;
        } else if (pathIdx >= this.data.filePaths.length) {
            return call();
        }
        var that = this;
        request.uploadFile('/api/user/upload_comment_img', {
            filePath: that.data.filePaths[pathIdx],
            name: 'comment_img_file',
            success: function (res) {
                that.data.uploadPath[pathIdx] = res.data.result;
                that.uploadPhotos(call, pathIdx + 1); //递归上传多张图片
            }
        });
    }

})