           // pages/article/index/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    ats:[],
    isloader:false,
    isnomore:false
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setinfo()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(this.data.ats==[]){
      this.setinfo()
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  skip:1,
  setinfo:function(){
    if (this.data.isloader||this.data.isnomore) {
      return
    }
    this.setData({
      isloader:true
    })
    var that=this
    const db = wx.cloud.database()
    db.collection('articles')
      .skip(this.skip)
      .field({
        at_name: true
      })
      .limit(20)
      .get()
      .then(res=>{
        this.setData({
          ats: this.data.ats.concat(res.data),
          isloader:false,
          isnomore: res.data.length<10?true:false
        })
        that.skip = that.skip + res.data.length
      })
      .catch(console.error)
  },
  acst:function(e){
    var atid = e.currentTarget.dataset.atid
    wx.navigateTo({
      url: '/pages/look/look?atid=' + atid
    })
  },
  bindscrolltolower:function(e){
    this.setinfo()
  }
})