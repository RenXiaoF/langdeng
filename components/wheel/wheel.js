/**
 * Class Wheel
 * @class
 * @classdesc 大转盘游戏逻辑部分
 * @author pfan
 * @todo 注意：移动端真机，不支持requestAnimationFrame.
 * 
 * @example
 *  new Wheel(this,{
 *    areaNumber: 8,   //抽奖间隔
 *    speed: 16,       //转动速度
 *    awardNumer: 2,   //中奖区域从1开始
 *    mode: 1,         //1是指针旋转，2为转盘旋转
 *    callback: (idx, award) => {
 *      //结束回调， 参数对应宫格索引，对应奖项    
 *    }
 *  })
 */
class Wheel {
  /**
   * @constructs Wheel构造函数
   * @param  {Object} pageContext page路由指针
   * @param  {Object} opts      组件所需参数
   * @param  {Number} opts.areaNumber  抽奖间隔
   * @param  {Number} opts.speed       转动速度
   * @param  {Number} opts.awardNumer  中奖区域从1开始
   * @param  {Number} opts.mode     1是指针旋转，2为转盘旋转
   * @param  {String} opts.bgImg    背景圆盘图片
   * @param  {String} opts.pointerImg  指针图片
   * @param  {Function} opts.callback    结束回调
   */  
  constructor (pageContext, opts) {
    this.page = pageContext
    this.deg = 0 
    this.areaNumber = opts.areaNumber  // 奖区数量
    this.speed = opts.speed || 16   // 每帧速度
    this.awardNumer = opts.awardNumer //中奖区域 从1开始
    this.mode = opts.mode || 2
    this.bgImg = opts.bgImg || '/components/wheel/images/dial_bg.png'
    this.pointerImg = opts.pointerImg || '/components/wheel/images/dial_pointer.png'
    this.singleAngle = ''   //每片扇形的角度
    this.isStart = false
    this.endCallBack = opts.callback


    this.init()

    this.page.start = this.start.bind(this)
  }

  init () {
    let { areaNumber, singleAngle, mode, bgImg, pointerImg} = this
    singleAngle = 360 / areaNumber
    this.singleAngle = singleAngle
    this.page.setData({
      wheel: {
        singleAngle: singleAngle,
        mode: mode,
        bgImg: bgImg,
        pointerImg: pointerImg
      }
    })
  }

  start () {
    let {deg, awardNumer, singleAngle, speed, isStart, mode} = this
    if(isStart)return
    this.isStart = true
    let endAddAngle = (awardNumer - 1) * singleAngle + singleAngle/2 + 360   //中奖角度
    let rangeAngle = (Math.floor(Math.random() * 4) + 4) * 360 // 随机旋转几圈再停止  
    let cAngle
    deg = 0
    this.timer = setInterval( () => {
      if( deg < rangeAngle ){
        deg += speed
      }else{
        cAngle = (endAddAngle + rangeAngle - deg) / speed
        cAngle = cAngle > speed ? speed : cAngle < 1 ? 1 : cAngle
        deg += cAngle
        console.log(deg);
        if(deg >= ( endAddAngle + rangeAngle )){
          deg = endAddAngle + rangeAngle
          this.isStart = false
          clearInterval(this.timer)
          this.endCallBack(endAddAngle, rangeAngle)         
        }
      }
      
      this.page.setData({
        wheel: {
          singleAngle: singleAngle,
          deg: deg,
          mode: mode
        }
      })
    }, 1000/60)      
  }

  reset () {
    let {mode} = this
    this.deg = 0
    this.page.setData({
      wheel: {
        singleAngle: this.singleAngle,
        deg: 0,
        mode: mode
      }
    })    
  }

  switch (mode) {
    this.mode = mode
  }

}

export default Wheel

