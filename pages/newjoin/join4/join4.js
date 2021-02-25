Page({
    data: {
        status: 0,
    },

    onLoad: function (options) {
        this.setData({ status: options.status });
    },

    goBack: function(){
        if (this.data.status==2){
            wx.redirectTo({ url: '/pages/newjoin/join1/join1?status=2' });
        }else{
            wx.switchTab({ url: '/pages/user/index/index' })
        }
    },

})