//app.js
App({
  onLaunch: function () {
    var day = new Date()
    this.globalData.dk = 'd' + day.getFullYear() + (day.getMonth() + 1) + day.getDate()
    var datas = wx.getStorageSync('datas')
    if (!datas) {
      var data={}
      data[this.globalData.dk]={
        vcs:[],
        sts:[],
        ats:[]            
      }
      this.globalData.dayinfo=data
      wx.setStorage({
        key: 'datas',
        data: data,
        oksum: 0
      })
    } else{
      if (!datas[this.globalData.dk]){
        datas[this.globalData.dk] = {
          vcs: [],
          sts: [],
          ats: []
        }
        this.globalData.dayinfo = datas[this.globalData.dk] 
        wx.setStorage({
          key: 'datas',
          data: datas,
          oksum: 0
        })
      }else{
        this.globalData.dayinfo = datas[this.globalData.dk] 
      }
    }
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        var code = res.code;  //获取code
        wx.request({
          url: getApp().globalData.domainName + '/index/user/login',
          data: {
            "code": code,
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          success: function (info) {
            if (info.data) {
              getApp().globalData.sessionInfo = 'PHPSESSID=' + info.data.sessionid;
              // if (!info.data.isOldUser) {
              //   wx.reLaunch({
              //     url: '/buyer/userpages/addphone/addphone'
              //   })
              // }
            }

          },
          fail: function (e) {
            console.log(e)
          }
        })
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    sessionInfo:null,
    dk:null,
    dayinfo:null,
    dictation:[],
    domainName:'https://wx.thatblog.cn',
    netFail:function(e){
      wx.showToast({
        icon: 'none',
        title:'网络请求失败，请检查网络状态!'
      })
    },
    collect:function(id,ctype){
      var app=getApp()
      if(ctype=='vc'){
        if (app.globalData.dayinfo.vcs.indexOf(id)<0){
          app.globalData.dayinfo.vcs.push(id)
        }
      }else{
        if (app.globalData.dayinfo.sts.indexOf(id) < 0) {
          app.globalData.dayinfo.sts.push(id)
        }
      }
    },
    uncollect: function (id, ctype) {
      if (ctype == 'vc') {
        var idx = app.globalData.dayinfo.vcs.indexOf(id)
        if(idx>-1){
          app.globalData.dayinfo.vcs.splice(idx, 1);
        }
      }else{
        var idx = app.globalData.dayinfo.sts.indexOf(id)
        if (idx > -1) {
          app.globalData.dayinfo.sts.splice(idx, 1);
        }
      }
    }
  }
})