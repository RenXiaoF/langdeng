// pages/user/coin_apply/coin_apply.js
var app = getApp();
var request = app.request;
var common = require('../../../utils/common.js');
import LoadMore from '../../../utils/LoadMore.js';
var util = require('../../../utils/util.js');
var load = new LoadMore;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.globalData.setting.url,
    resourceUrl: app.globalData.setting.resourceUrl,
    project_id:'',
    edit_id:'',
    project:[],
    info:[],
    date: '2018-08-10',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({project_id:options.project_id});
    this.setData({edit_id:options.edit_id});
    var project = this.data.project_id;
    var edit = this.data.edit_id;
    this.getcoininfo(project,edit);
  },

  //获取页面信息
  getcoininfo: function(project,edit) {

    var that = this;
    if(!project){
      app.showWarning('请选择项目', function () {
        wx.navigateBack();
      });
    }else{
      request.post(this.data.url + '/api/user/coin_apply_page', {
        data: {
          project_id: project,
          edit_id: edit
        },
        success: function (res) {
          console.log('res_getcoininfo');
          console.log(res);
          
          
          // res.data.result.info.work_time = util.formatTime(res.data.result.info.work_time, false);
         
          that.setData({date:res.data.result.info.work_time});
          that.setData({project:res.data.result.project});
          that.setData({info:res.data.result.info});
        }
      })
    }
  },

  /**
     * 提交选择的项目
     */
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var project_id = e.detail.value.project_id;
    var edit_id = e.detail.value.edit_id;
    var CoinNum = e.detail.value.CoinNum;
    var work_time = e.detail.value.work_time;
    var that = this;

    var reg = /^[-\+]?\d+(\.\d+)?$/;
    if(!reg.test(CoinNum)){
      app.showWarning('积分数量为整数！');
      return;
    }

    if(CoinNum<=0||work_time<=0){
      app.showWarning('请正确填写！',function(){
      });
    }else{
      request.get(that.data.url + '/api/user/coin_apply', {
        data: {
          project_id: project_id,
          edit_id: edit_id,
          CoinNum: CoinNum,
          work_time: work_time
        },
        success: function (res) {
          console.log("res");
          console.log(res);
          app.showWarning('更新成功！',function(){
            wx.navigateTo({ url: '/pages/user/coin_list/coin_list'});
          })
        }
      })
    }
  },

  /**
   * 选择时间
   */
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },

})