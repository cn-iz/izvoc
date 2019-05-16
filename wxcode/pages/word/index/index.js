// pages/word/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bkInfo:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var bkInfo = wx.getStorageSync('booksInfo')
    var acvcs = wx.getStorageSync('acvcs')
    this.setData({ bkInfo: bkInfo, acvcs: acvcs})
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
    this.readinfo()
  },readinfo:function(){
    var that = this
    setTimeout(function () {
      var bkInfo = wx.getStorageSync('booksInfo')
      var acvcs = wx.getStorageSync('acvcs')
      that.setData({ bkInfo: bkInfo, acvcs: acvcs })
    }, 300)
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
  acbk:function(e){
    wx.navigateTo({
      url: '/pages/word/look/look?bkid=' + e.currentTarget.dataset['bkid']
    })
  }, startlearn:function(e){
    wx.navigateTo({
      url: '/pages/word/learn/learn'
    })
  },
  add:function(){
    wx.navigateTo({
      url: '/pages/add/bklist/bklist',
    })
  },
  longtap:function(e){
    var that=this
    var bkid = e.currentTarget.dataset['bkid']
    wx.showActionSheet({
      itemList:['删除','取消'],
      itemColor:'#ff2222',
      success:function(e){
        if(e.tapIndex==0){
          var bkInfo = wx.getStorageSync('booksInfo')
          delete bkInfo[bkid]
          console.log(bkInfo)
          wx.setStorage({
            key: 'booksInfo',
            data: bkInfo
          })
          setTimeout(function(){
            that.readinfo()
          },300)
        }
      }
    })
  }
})