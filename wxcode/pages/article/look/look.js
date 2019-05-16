// pages/sentence/look/look.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    atinfo: null,
    idx:0,
    audiorun:false,
    word:null,
    current:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var atid = options.atid
    this.setatinfo(atid)
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
  setatinfo: function (atid) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    wx.request({
      url: getApp().globalData.domainName + '/index/sql/getatinfobyid',
      data: {
        atid: atid
      },
      header: {
        'content-type': 'application/json', // 默认值
        'cookie': getApp().globalData.sessionInfo
      },
      success: function (res) {
        console.log(res.data)
        that.setData({ atinfo: res.data }, () => {
          wx.hideLoading()
        })
      },
      fail: getApp().globalData.netFail
    })
  }, settype:function(e){
    var type = e.currentTarget.dataset.type
    this.setData({ idx:type,current:type })
  },
  iac: wx.createInnerAudioContext(),
  audio:function(e){
    var iac=this.iac
    var that=this
    if (this.data.audiorun) {
      iac.pause()
      that.setData({
        audiorun: false
      })
      return
    }
    iac.src = getApp().globalData.domainName +'/static/audios/at_phs/'+this.data.atinfo.id+'.mp3'
    that.setData({
      audiorun: true
    })
    iac.onCanplay(function () {
      iac.play()
    })
    iac.onEnded(function () {
      that.setData({
        audiorun: false
      })
    })
  },
  // 从头播放
  reaudio:function(){
    var iac = this.iac
    if(!iac.src){
      this.audio()
      return
    }
    iac.seek(0)
  },
  closeword:function(){
    this.setData({word:null})
  },
  findword:function(e){
    var w = e.currentTarget.dataset.w.replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?]/g, "")
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    wx.request({
      url: getApp().globalData.domainName + '/index/sql/findvc',
      data: {
        w: w
      },
      header: {
        'content-type': 'application/json', // 默认值
        'cookie': getApp().globalData.sessionInfo
      },
      success: function (res) {
        console.log(res.data)
        that.setData({  word: res.data}, () => {
          wx.hideLoading()
        })
      }
    })
  },
  iac2: wx.createInnerAudioContext(),
  openvideo: function (e) {
    if (e.target.dataset.hasOwnProperty('word')) {
      return
    }
    if (e.target.dataset.hasOwnProperty('vcid')) {
      var sts = this.data.sts
      if (sts[e.target.dataset.vcid][e.target.dataset.idx].isac) {
        sts[e.target.dataset.vcid][e.target.dataset.idx].isac = false
        var index = this.acstsids.indexOf(sts[e.target.dataset.vcid][e.target.dataset.idx].st_id);
        if (index > -1) {
          this.acstsids.splice(index, 1);
        }
      } else {
        sts[e.target.dataset.vcid][e.target.dataset.idx].isac = true
        var index = this.acstsids.indexOf(sts[e.target.dataset.vcid][e.target.dataset.idx].st_id);
        if (index < 0) {
          this.acstsids.push(sts[e.target.dataset.vcid][e.target.dataset.idx].st_id)
        }
      }
      this.setData({
        sts: sts
      })
      return;
    }
    var iac = this.iac2
    iac.src = 'https:/' + e.currentTarget.dataset.src
    iac.onCanplay(function () {
      iac.play()
    })
  }, binfh:function(e){
    var idx=e.detail.current
    this.setData({idx:idx})
  }
})