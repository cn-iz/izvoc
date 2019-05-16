// pages/word/look/look.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    low: 0,
    runhorn: null,
    vcs: [],
    sts: {},
    showword: null,
    current: 0,
    page: 0,
    duration: 520,
    count: 0
  }, acvcs: null,
  acvcsids: [],
  acsts: null,
  acstsids: [],
  dk:null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dk=options.dk
    var day = new Date()
    var datas = wx.getStorageSync('datas')
    this.acstsids = datas[this.dk].sts
    this.acvcsids = datas[this.dk].vcs
    // this.low = acvcs.lastidx
    this.low = 0
    this.getWords('R')
    this.setData({ count: this.acvcsids.length })
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
    this.saveinfo()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.saveinfo()
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    // this.saveinfo()
  },
  // 持久化数据
  saveinfo: function () {
    if (!this.current == null) {
      return
    }
    var datas = wx.getStorageSync('datas')
    datas[this.dk].vcs=this.acvcsids
    datas[this.dk].sts = this.acstsids
    wx.setStorage({
      key: 'datas',
      data: datas,
      oksum: 0
    })
  },
  getWords: function (to) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var low = this.low
    if (to == 'R') {
      this.low = this.low + this.data.vcs.length
      if (!(this.data.page < this.acvcsids.length)) {
        this.low = 0
      }
    } else {
      if (this.low > 0) {
        this.low = this.low - 10
        if (this.low < 0) {
          this.low = 0
        }
      } else {
        this.low = this.acvcsids.length - 10 < 0 ? 0 : this.acvcsids.length - 10
      }
    }
    var that = this
    var ids = this.acvcsids.slice(low, low + 10 > this.acvcsids.length ? this.acvcsids.length : low + 10)
    wx.request({
      url: getApp().globalData.domainName + '/index/sql/getvcsbyids',
      data: {
        ids: ids
      },
      method: 'POST'
      ,
      header: {
        'content-type': 'application/json',
        'cookie': getApp().globalData.sessionInfo
      },
      success: function (res) {
        // 检查是否被选中
        for (var i in res.data.vc) {
          var idx = that.acvcsids.indexOf(res.data.vc[i].vc_id)
          if (idx > -1) {
            res.data.vc[i].isac = true
          }
          // 句子
          for (var j in res.data.st[res.data.vc[i].vc_id]) {
            var idx = that.acstsids.indexOf(res.data.st[res.data.vc[i].vc_id][j].st_id)
            if (idx > -1) {
              res.data.st[res.data.vc[i].vc_id][j].isac = true
            }
          }
        }
        var current = 1
        if (to == 'L') {
          if (that.low == 0) {
            current = low
          }
          if (low == 0) {
            current = that.acvcsids.length > 10 ? 10 : that.acvcsids.length
          }
        } else {
          current = 1
        }
        var arr = []
        for (var ac in ids) {
          arr.push(res.data.vc[ids[ac]])
        }
        that.current = current
        that.setData({
          vcs: arr,
          sts: res.data.st,
          duration: 0,
          low: that.low
        }, () => {
          that.setData({
            current: current,
            page: current + that.low,
            duration: 520
          }, () => {
            wx.hideLoading()
          })
        })
        that.current = current
      },
      fail: getApp().globalData.netFail
    })
  },
  iac: wx.createInnerAudioContext(),
  runhorn: function (e) {
    var that = this;
    that.setData({
      runhorn: e.currentTarget.dataset.h
    })
    var iac = this.iac
    iac.onError(function () {
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
    if (iac.src == 'https:/' + src) {
      iac.play()
    } else {
      iac.src = 'https:/' + src
      iac.onCanplay(function () {
        iac.play()
      })
    }
    iac.onEnded(function () {
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
    var iac = this.iac
    if (iac.src == 'https:/' + e.currentTarget.dataset.src){
      iac.play()
    }else{
      iac.src = 'https:/' + e.currentTarget.dataset.src
      iac.onCanplay(function () {
        iac.play()
      })
    }
  },
  offshow: function (e) {
    this.setData({
      showword: null
    })
  },
  bindchange: function (e) {
    this.current = e.detail.current
    if (e.detail.currentItemId == "left") {
      this.getWords('L')
    }
    if (e.detail.currentItemId == 'right') {
      this.getWords('R')
    }
  },
  bindanimationfinish: function (e) {
    this.setData({
      page: this.low + e.detail.current
    })
  },
  acVc: function (e) {
    var idx = e.currentTarget.dataset.idx
    var vcs = this.data.vcs
    if (vcs[idx].isac) {
      var index = this.acvcsids.indexOf(vcs[idx].vc_id);
      if (index > -1) {
        this.acvcsids.splice(index, 1);
      }
      vcs[idx].isac = false
    } else {
      var index = this.acvcsids.indexOf(vcs[idx].vc_id);
      if (index < 0) {
        this.acvcsids.push(vcs[idx].vc_id)
      }
      vcs[idx].isac = true
    }
    this.setData({
      vcs: vcs
    })
  },
  closeword: function () {
    this.setData({ word: null })
  },more:function(e){
    var idx=e.currentTarget.dataset.idx
    var that=this
    wx.showActionSheet({
      itemList:['添加到今日收藏','随机听写','顺序听写','返回'],
      success:function(res){
        if (res.tapIndex==0){
          getApp().globalData.collect(vcs[idx].vc_id,'vc')
        }
        if (res.tapIndex == 1) {
          getApp().globalData.dictation = that.acvcsids
          wx.navigateTo({
            url: '/pages/learn/dictation/dictation?mode=' + 'disorder'
          })
        }
        if (res.tapIndex == 2) {
          getApp().globalData.dictation=that.acvcsids
          wx.navigateTo({
            url: '/pages/learn/dictation/dictation?mode=' + 'order'
          })
        }
      }
    })
  }
})