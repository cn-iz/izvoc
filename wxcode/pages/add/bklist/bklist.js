// pages/add/bklist/bklist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clas:null,
    clasId:null,
    bks:null,
    listHeight:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this
    wx.request({
      url: getApp().globalData.domainName+'/index/sql/quary', 
      data: {
        sql: 'SELECT * FROM bk_tb where bk_level=1 ORDER BY bk_order'
      },
      header: {
        'content-type': 'application/json', // 默认值
        'cookie':getApp().globalData.sessionInfo
      },
      success: function (res) {
        that.setData({ clas : res.data})
      },
      fail: getApp().globalData.netFail
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
  acClas:function(e){
    var that=this
    if (this.data.clasId == e.currentTarget.dataset['clasid']){
      that.setData({ clasId: null, bks: null})
      return
    }
    if(that.data.listHeight==null){
      wx.createSelectorQuery().select('#clas_list_1').fields({
        size: true
      }, function (res) {
        that.setData({listHeight:res.height})
      }).exec()
    }
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: getApp().globalData.domainName + '/index/sql/quary',
      data: {
        sql: "SELECT * FROM bk_tb where bk_parent_id='" + e.currentTarget.dataset['clasid']+"' ORDER BY bk_order"
      },
      header: {
        'content-type': 'application/json', // 默认值
        'cookie': getApp().globalData.sessionInfo
      },
      success: function (res) {
        that.setData({clasId: e.currentTarget.dataset['clasid'], bks: res.data},()=>{
          wx.hideLoading()
        })
        var top = e.currentTarget.dataset['idx'] * that.data.listHeight
        wx.pageScrollTo({
          scrollTop: top,
          duration: 0
        })
      },
      fail: getApp().globalData.netFail
    }) 
  },
  acBk: function (e) {
    wx.navigateTo({
      url: '/pages/add/vclist/vclist?bkid=' + e.currentTarget.dataset['bkid']
    })
  }
})