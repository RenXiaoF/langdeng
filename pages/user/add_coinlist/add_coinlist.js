// pages/user/add_coinlist/add_coinlist.js
var app = getApp();
var request = app.request;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: app.globalData.setting.url,
    resourceUrl: app.globalData.setting.resourceUrl,
    project_lists:[],//所有项目
    project_id:'',//所选项目的id
    edit_id:'',//列表id
    coin_apply:''//列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var project_id = typeof options.project_id == 'undefined' ? this.data.project_id : options.project_id;
    var edit_id = typeof options.edit_id == 'undefined' ? this.data.edit_id : options.edit_id;

    this.getProjectLists(project_id,edit_id); 
  },

  //获取所有项目
  getProjectLists: function (project_id,edit_id) {
    var that = this;
    request.get(that.data.url +'/api/user/getProjectLists',{
      data:{
        project_id: project_id,
        edit_id: edit_id
      },
      success: function(res){
        var apply = res.data.result.coin_apply;
        var lists = res.data.result.project_lists;
        for(var idx in lists){
          if(lists[idx].id==apply.project_id){
            lists[idx].checked=true;
          }
        }

        that.setData({ coin_apply: apply})
        that.setData({ project_lists: lists});
        that.setData({ edit_id: apply.id });
      }
    });
  },

  /**
   * 选择项目
   */
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
  },
  /**
   * 提交选择的项目
   */
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value);
    var project_id = e.detail.value.project_id;
    var edit_id = this.data.edit_id;
    this.setData({project_id:project_id});

    var params='';
    params += '?project_id='+project_id+'&edit_id='+edit_id;
    params && wx.navigateTo({ url: "/pages/user/coin_apply/coin_apply" + params });
  },
})