// return_goods.js
var app = getApp();
var setting = app.globalData.setting;
var request = app.request;
var common = require('../../../utils/common.js');
var select = require('../../../utils/selectFiles.js');

Page({
    data: {
        url: setting.url,
        resourceUrl: setting.resourceUrl,
        defaultPhoto: setting.resourceUrl + '/static/images/camera.png',
        filePaths: [], //本地图片的路径
        uploadPath: [], //上传图片的路径
        order: null, //请求的订单数据
        recId: 0, 
        maxWord: 0, //最多输入的描述字符数提醒
        isLongPress: false, //是否进行长按图片操作,解决有些手机上短按和长按同时触发的问题
        checkBtns: [], //["仅退货", "退货退款", "换货", '维修'],//服务按钮tab
        typeBtnIndex:0,  //服务按钮索引
        applyNum:1,//申请数量
        isReceive: false,
        causeCont:'注意保持商品的完好,建议您先与卖家沟通',  //提交原因，默认提示文字
        causeList:["订单不能按预计时间送达", "操作有误（商品、地址等选错）", "重复下单/误下单", "其他渠道价格更低", "该商品降价了", "不想买了", "其他原因，详见问题描述"],
        checkCauseIndex:-1,
        popState:true,
        description: '',
    },

    onLoad: function (options) {
        var that = this;
        this.setData({ recId: options.rec_id });
        this.requestReturnGoods(options.rec_id);
    },

    requestReturnGoods: function (rec_id) {
        var that = this;
        request.get('/api/order/return_goods', {
            failRollback: true,
            data: { rec_id: rec_id },
            success: function (res) {
                that.setData({ 
                    order: res.data.result,
                    applyNum: res.data.result.goods_num,
                    checkBtns: res.data.result.return_method
                });
            }
        });
    },

    /** 输入问题描述 */
    InputDescription: function (e) {
        this.setData({ maxWord: e.detail.value.length });
        this.data.description = e.detail.value;
    },

    /** 选择货物的状态 */
    selectGoodsStatus: function (e) {
        this.setData({ isReceive: e.currentTarget.dataset.status });
    },

    /** 选择服务类型 */
    selectServiceType:function(e){
        this.setData({ typeBtnIndex: e.currentTarget.dataset.i });
    },

    /** 申请数量 */
    setNum: function(e){
        this.checkApplyNum(Number(e.detail.value));
    },

    subNum: function(){
        this.checkApplyNum(this.data.applyNum - 1);
    },

    addNum: function () {
        this.checkApplyNum(this.data.applyNum + 1);
    },

    checkApplyNum: function (num) {
        if (isNaN(num)) {
            num = this.data.order.goods_num;
        } else if (num < 1) {
            num = 1;
        } else if (num > this.data.order.goods_num) {
            num = this.data.order.goods_num;
        }
        this.setData({ applyNum: num });
    },

    /** 提交原因弹窗 */
    openPop:function(){
        this.setData({ popState: false });
    },

    closePop:function(){
        this.setData({ popState: true });
    },

    /** 选择申请原因 */
    selectCause:function(e) {
        this.setData({
            checkCauseIndex: e.currentTarget.dataset.i,
            causeCont: this.data.causeList[e.currentTarget.dataset.i]
        });
        this.closePop();
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
    removePhoto: function (e) {
        var that = this;
        this.data.isLongPress = true;
        select.removePhoto(this.data.filePaths, e.currentTarget.dataset.idx, function (filePaths) {
            that.setData({ filePaths: filePaths });
        });
    },

    /** 提交申请 */
    submiApply: function () {
        var that = this;
        this.checkSubmit(function() {
            that.uploadPhotos(function () {
                request.post('/api/order/return_goods', {
                    data: {
                        rec_id: that.data.recId,
                        type: that.data.typeBtnIndex,
                        goods_num: that.data.applyNum,
                        reason: that.data.causeCont,
                        describe: that.data.description,
                        goods_id: that.data.order.goods_id,
                        order_id: that.data.order.order_id,
                        order_sn: that.data.order.order_sn,
                        spec_key: that.data.order.spec_key,
                        is_receive: Number(that.data.isReceive),
                        imgs: that.data.uploadPath.join(',')
                    },
                    success: function (res) {
                        wx.showToast({
                            title: '提交成功',
                            mask: true,
                            duration: 1000,
                            complete: function () {
                                setTimeout(function () {
                                    wx.navigateBack();
                                }, 1000);
                            }
                        });
                    }
                });
            });
        });
    },

    /** 上传多图片 */
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
        request.uploadFile('/api/order/upload_return_goods_img', {
            filePath: that.data.filePaths[pathIdx],
            name: 'return_imgs',
            success: function (res) {
                that.data.uploadPath[pathIdx] = res.data.result;
                that.uploadPhotos(call, pathIdx + 1); //递归上传多张图片
            }
        });
    },

    checkSubmit: function(call) {
        if (this.data.checkCauseIndex < 0) {
            return app.showWarning("请先选择提交原因");
        }
        if (this.data.description.length == 0) {
            return app.showWarning("请先填写问题描述");
        }
        if (this.data.filePaths.length == 0) {
            return wx.showModal({
                title: '确定不上传图片吗？',
                success: function (res) {
                    if (res.confirm) {
                        call();
                    }
                }
            })
        }
        call();
    }

});