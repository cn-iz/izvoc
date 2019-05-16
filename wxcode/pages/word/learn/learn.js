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
    page:0,
    duration: 520,
    count:0
  }, acvcs: null,
  acvcsids: [],
  acsts: null,
  acstsids: [],

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var day=new Date()
    var dk='d'+day.getFullYear()+(day.getMonth()+1)+day.getDate()
    var datas=wx.getStorageSync('datas')
    var acsts = datas[dk]
    if(!acsts){
      acsts=[]
    }
    for (var i in acsts.sts) {
      this.acstsids.push(acsts.sts[i].id)
    }
    this.acsts = acsts
    var acvcs = wx.getStorageSync('acvcs')
    for (var i in acvcs.vcs) {
      this.acvcsids.push(acvcs.vcs[i].id)
    }
    this.acvcs = acvcs
    this.low = acvcs.lastidx
    this.getWords('R')
    this.setData({count:acvcs.vcs.length})
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
    var acvcs = this.acvcs.vcs
    // 删除减去的
    var i = 0;
    while (i < acvcs.length) {
      var idx = this.acvcsids.indexOf(acvcs[i].ac_id)
      if (idx < 0) {
        acvcs.splice(i, 1)
        i--
      } else {
        this.acvcsids.splice(idx, 1)
      }
      i++
    }
    for (var v in this.acvcsids) {
      acvcs.push({
        id: this.acvcsids[v],
        state: 1,
        looked: 0,
        bkid: this.data.bkid
      })
    }
    this.acvcs.vcs = acvcs
    this.acvcs.lastidx=this.data.page-1
    wx.setStorage({
      key: 'acvcs',
      data: this.acvcs
    })
    var acsts = this.acsts.sts
    var i = 0
    while (i < acsts.length) {
      var idx = this.acstsids.indexOf(acsts[i].id)
      if (idx < 0) {
        acsts.splice(i, 1)
        i--
      } else {
        this.acstsids.splice(idx, 1)
      }
      i++
    }
    for (var v in this.acstsids) {
      acsts.push({
        id: this.acstsids[v],
        state: 1,
        looked: 0
      })
    }
    this.acsts.sts = acsts
    wx.setStorage({
      key: 'acsts',
      data: this.acsts
    })
  } ,
  getWords: function (to) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var low = this.low
    if (to == 'R') {
      this.low = this.low + this.data.vcs.length
      if (!( this.data.page < this.acvcsids.length)) {
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
      method:'POST'
      ,
      header: {
        'content-type': 'application/json',
        'cookie': getApp().globalData.sessionInfo
      },
      success: function (res) {
        console.log(res.data)
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
            current = that.acvcsids.length > 10? 10: that.acvcsids.length
          }
        } else {
          current = 1
        }
        var arr=[]
        for(var ac in ids){
          arr.push(res.data.vc[ids[ac]])
        }
        that.current = current
        that.setData({
          vcs: arr,
          sts: res.data.st,
          duration: 0,
          low: that.low
        },()=>{
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
    iac.src = 'https:/' + src
    iac.onCanplay(function () {
      iac.play()
    })
    console.log(iac.src)
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
    iac.src = 'https:/' + e.currentTarget.dataset.src
    iac.onCanplay(function () {
      iac.play()
    })
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
  sx:function(){
    wx.showActionSheet({
      itemList: ['生词', '半生词','生词+半生词','熟词'],
      itemColor: '#000',
      success: function (e) {

      }
    })
  },
  closeword: function () {
    this.setData({ word: null })
  }
})