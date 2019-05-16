
Page({

  /**
   * 页面的初始数据
   */
  data: {
    low: 0,
    bkid: null,
    bkInfo: null,
    runhorn: null,
    vcs: [],
    sts: {},
    word: null,
    current: 0,
    page: 0,
    duration: 520
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var app=getApp()
    var bkInfo = wx.getStorageSync('booksInfo')
    this.setData({
      bkid: options.bkid,
      bkInfo: bkInfo[options.bkid]
    })
    this.low = bkInfo[options.bkid].lastidx
    this.getWords('R')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.saveinfo()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    this.saveinfo()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    // this.saveinfo()
  },
  // 持久化数据
  saveinfo: function() {
    if (!this.current == null) {
      return
    }
    var bookInfo = wx.getStorageSync('booksInfo')
    var bkInfo = this.data.bkInfo
    bookInfo[bkInfo.bk_id].lastidx = this.low + this.current - 1
    wx.setStorage({
      key: 'booksInfo',
      data: bookInfo
    })
    var app=getApp()
    var datas = wx.getStorageSync('datas')
    datas[app.globalData.dk]=app.globalData.dayinfo
    wx.setStorage({
      key: 'datas',
      data: datas
    })
  },
  getWords: function(to) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var low = this.low
    if (to == 'R') {
      this.low = this.low + this.data.vcs.length
      if (!(this.data.page < this.data.bkInfo.bk_direct_item_num)) {
        this.low = 0
      }
    } else {
      if (this.low > 0) {
        this.low = this.low - 10
        if (this.low < 0) {
          this.low = 0
        }
      } else {
        this.low = this.data.bkInfo.bk_direct_item_num - 10
      }
    }
    var that = this
    var app=getApp()
    wx.request({
      url: getApp().globalData.domainName + '/index/sql/getvc',
      data: {
        start: this.low,
        len: 10,
        bkid: this.data.bkid
      },
      header: {
        'content-type': 'application/json',
        'cookie': app.globalData.sessionInfo
      },
      success: function(res) {
        // 检查是否被选中
        for (var i in res.data.vc) {
          var idx = app.globalData.dayinfo.vcs.indexOf(res.data.vc[i].vc_id)
          if (idx > -1) {
            res.data.vc[i].isac = true
          }
          // 句子
          for (var j in res.data.st[res.data.vc[i].vc_id]) {
            var idx = app.globalData.dayinfo.sts.indexOf(res.data.st[res.data.vc[i].vc_id][j].st_id)
            if (idx > -1) {
              res.data.st[res.data.vc[i].vc_id][j].isac = true
            }
          }
        }
        var current = 1
        if (to == 'L') {
          current = 10
          if (that.low == 0) {
            current = low
          }
        } else {
          current = 1
        }

        that.current = current
        that.setData({
          vcs: res.data.vc,
          sts: res.data.st,
          duration: 0,
          low: that.low
        },()=>{
          that.setData({
            current: current,
            page: current + that.low,
            duration: 520
          },()=>{
            wx.hideLoading()
          })
        })
      },
      fail: getApp().globalData.netFail
    })
  },
  iac: wx.createInnerAudioContext(),
  runhorn: function(e) {
    var that = this;
    that.setData({
      runhorn: e.currentTarget.dataset.h
    })
    var iac = this.iac
    iac.onError(function() {
      that.setData({
        runhorn: null
      })
    })
    var src = ""
    if (e.currentTarget.dataset.h == 1) {
      src = "/fanyi.baidu.com/gettts?lan=en&text=" + that.data.vcs[e.currentTarget.dataset.idx].vc_vocabulary + "&spd=3&source=web"
    }
    if (e.currentTarget.dataset.h == 2) {
      src = that.data.vcs[e.currentTarget.dataset.idx].vc_ph_us
    }
    if (e.currentTarget.dataset.h == 3) {
      src = that.data.vcs[e.currentTarget.dataset.idx].vc_ph_en
    }
    if (src == '') {
      wx.showToast({
        title: '暂时没有发音'
      })
      return
    }
    iac.src = 'https:/' + src
    iac.onCanplay(function() {
      iac.play()
    })
    iac.onEnded(function() {
      that.setData({
        runhorn: null
      })
    })
  },
  findword: function (e) {
    var w = e.currentTarget.dataset.word.replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?]/g, "")
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
        that.setData({ word: res.data }, () => {
          wx.hideLoading()
        })
      },
      fail: getApp().globalData.netFail
    })
  },
  openvideo: function(e) {
    if (e.target.dataset.hasOwnProperty('word')) {
      return
    }
    if (e.target.dataset.hasOwnProperty('vcid')) {
      return;
    }
    var iac = this.iac
    iac.src = 'https:/' + e.currentTarget.dataset.src
    iac.onCanplay(function() {
      iac.play()
    })
  },
  offshow: function(e) {
    this.setData({
      showword: null
    })
  },
  bindchange: function(e) {
    this.current = e.detail.current
    if (e.detail.currentItemId == "left") {
      this.getWords('L')
    }
    if (e.detail.currentItemId == 'right') {
      this.getWords('R')
    }
  },
  bindanimationfinish: function(e) {
    this.setData({
      page: this.low + e.detail.current
    })
  },
  acVc: function(e) {
    var app=getApp()
    var idx = e.currentTarget.dataset.idx
    var vcs = this.data.vcs
    if (vcs[idx].isac) {
      app.globalData.uncollect(vcs[idx].vc_id,'vc')
      vcs[idx].isac = false
    } else {
      app.globalData.collect(vcs[idx].vc_id,'vc')
      vcs[idx].isac = true
    }
    this.setData({
      vcs: vcs
    })
  },
  acSt:function(e){
    var app = getApp()
    var idx = e.currentTarget.dataset.idx
    var vcid = e.currentTarget.dataset.vcid
    console.log(vcid)
    var sts= this.data.sts
    if (sts[vcid][idx].isac) {
      app.globalData.uncollect(sts[vcid][idx].st_id, 'st')
      sts[vcid][idx].isac = false
    } else {
      app.globalData.collect(sts[vcid][idx].st_id, 'st')
      sts[vcid][idx].isac = true
    }
    this.setData({
      sts: sts
    })
  },
  closeword: function () {
    this.setData({ word: null })
  }
})