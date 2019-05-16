// pages/learn/dictation/dictation.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    vc:null,
    show:true,
    sts:null
  },
  mode:'order',
  vcs:null,
  vcids:null,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.mode = options.mode
    var that = this
    this.vcids=getApp().globalData.dictation
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: getApp().globalData.domainName + '/index/sql/getvcsbyids',
      data: {
        ids: this.vcids
      },
      method: 'POST'
      ,
      header: {
        'content-type': 'application/json',
        'cookie': getApp().globalData.sessionInfo
      },
      success: function (res) {
        that.vcs=res.data
        var vcs=[]
        for (var i in that.vcs.vc){
          vcs.push(that.vcs.vc[i])
        }
        that.vcs.vc=vcs
        if (that.mode == 'disorder') {
          that.vcs.vc.sort(function () {
            return (0.5 - Math.random());
          })
        }
        that.setData({
          vc: that.vcs.vc[0],
          sts: that.vcs.st
        })
      },
      fail: getApp().globalData.netFail,
      complete:function(e){
        wx.hideLoading()
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  start:function(e){
    var vcs=[]
    this.runvcs = this.vcs.vc
    console.log(vcs)
    this.play(0,3)
  },
  runvcs:[],
  play:function(idx,t){
    if(t==3){
      this.setData({ vc: this.runvcs[idx]})
    }
    var iac = wx.createInnerAudioContext()
    var that=this
    console.log(idx)
    console.log(t)
    console.log('https:/' + this.runvcs[idx].vc_ph_us)
    iac.src = 'https:/' + this.runvcs[idx].vc_ph_us
    iac.onCanplay(function () {
        iac.play()
    })
    iac.onEnded(function () {
      setTimeout(function(e){
        t--
        if (t < 1) {
          if (idx < that.runvcs.length - 1) {
            that.play(idx + 1, 3)
          }
        } else {
          that.play(idx, t)
        }
        iac.destroy()
      }, 2000);
    })
  },
  show:function(e){
    if(this.data.show){
      this.setData({show:false})
    }else{
      this.setData({ show:true })
    }
  }
})