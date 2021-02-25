var app = getApp();
import LoadMore from '../../../utils/LoadMore.js'
var load = new LoadMore;

Page({
    data: {
        url: app.globalData.setting.url,
        resourceUrl: app.globalData.setting.resourceUrl,
        requestData: null,
        brandCurrentPage: 1
    },

    onLoad: function () {
        load.init(this, 'brand_list', 'requestData');
        this.requestBrandStreet();
    },

    requestBrandStreet: function () {
        var that = this;
        var requestUrl = '/api/index/brand_street' + '?p=' + that.data.brandCurrentPage;
        load.request(requestUrl, function () {
            that.data.brandCurrentPage++;
        });
    },

    onReachBottom: function () {
        if (load.canloadMore()) {
            this.requestBrandStreet();
        }
    }

});