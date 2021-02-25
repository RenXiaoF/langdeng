import Wheel from "../../../components/wheel/wheel.js"

Page({
  data: {
    mode: 2
  },

  onLoad () {
    let self = this
    this.wheel = new Wheel(this, {
      areaNumber: 16,
      speed: 16,
      awardNumer: 1,
      mode: 2,
      callback: (idx, award) => {
        console.log(idx);
        console.log(award);
        wx.showModal({
          title: '提示',
          content: '恭喜您，中奖了',
          showCancel: false,
          success: (res) => {
            //self.wheel.reset()
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })        
      }
    })

  },

  onReady () {
    console.log("onReady")    
  },

  onSwitchMode (event) {
    let mode = event.currentTarget.dataset.mode
    this.setData({mode})
    this.wheel.switch(mode)
  }  

})