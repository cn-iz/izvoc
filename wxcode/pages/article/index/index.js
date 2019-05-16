           // pages/article/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ats:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setinfo('')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(this.data.ats==[]){
      this.setinfo(this.lastw)
    }
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
  lastw:'',
  setinfo:function(w){
    this.lastw=w
    wx.showLoading({
      title: '加载中',
    })
    var that=this
    wx.request({
      url: getApp().globalData.domainName + '/index/sql/quary',
      data: {
        sql: "SELECT at_id,at_name from at_tb " +w
      },
      header: {
        'content-type': 'application/json', // 默认值
        'cookie': getApp().globalData.sessionInfo
      },
      success: function (res) {
        that.setData({ ats: res.data},()=>{
          wx.hideLoading()
        })
      },
      fail: getApp().globalData.netFail,
      complete:function(){
        wx.hideLoading()
      }
    })
  },
  acst:function(e){
    var atid = e.currentTarget.dataset.atid
    wx.navigateTo({
      url: '/pages/article/look/look?atid=' + atid
    })
  }
})