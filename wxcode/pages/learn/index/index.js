// pages/learn/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    y: 2018,
    m: 10,
    ms: ["Jan", "Feb ", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct ", "Nov ", "Dec"],
    d: 1,
    ds: [],
    vc_count:0,
    st_count:0,
    acdate:0
  },
  datas:null,
  dkl:null,
  acdk:null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var day = new Date();
    var that=this
    this.datas = wx.getStorageSync('datas')
    this.setData({ y: day.getFullYear(), m: day.getMonth() + 1, d: day.getDate()},()=>{
      that.setDate()
    })
  },
  setDate:function(){
    var datas = this.datas
    var day = new Date(this.data.y, this.data.m, this.data.d)
    var d = new Date(day.getFullYear(), day.getMonth() + 1, 0);
    var ds = [];
    for (var i = 0; i < day.getDay(); i++) {
      ds.push('')
    }
    var date=-1;
    var now = new Date();
    if (now.getFullYear() == day.getFullYear() && now.getMonth() == day.getMonth() - 1) {
      date = this.data.d
    }
    var dkl = 'd' + day.getFullYear() + (day.getMonth() )
    this.dkl=dkl
    for (var i = 1; i < d.getDate() + 1; i++) {
      if(date==i){
        ds.push({ clas: 'nowday', date: i })
        continue
      }
      if (datas[dkl + i]){
        var dayinfo = datas[dkl + i]
        if(dayinfo.vcs.length > 0 || dayinfo.sts.length>0){
          ds.push({ clas: 'greenyellow', date: i })
        }else{
          ds.push({ clas: '', date: i })
        }
      }else{
        ds.push({ clas:'',date:i})
      }
    }
    if (this.datas[this.dkl + this.data.d]){
      this.setData({ ds: ds, acdate: date, vc_count: this.datas[this.dkl + this.data.d].vcs.length, st_count: this.datas[this.dkl + this.data.d].sts.length})
    }
    else{
      this.setData({ ds: ds, acdate: date, vc_count: 0, st_count: 0 })
    }
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
    this.datas = wx.getStorageSync('datas')
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

  },l:function(){
    if(this.data.m==1){
      this.setData({m:12,y:this.data.y-1},()=>{
        this.setDate()
      })
    } else{
      this.setData({ m: this.data.m - 1 }, () => {
        this.setDate()
      })
    }
  },
  r: function () {
    if (this.data.m == 12) {
      this.setData({ m: 1, y: this.data.y + 1 }, () => {
        this.setDate()
      })
    } else {
      this.setData({ m: this.data.m + 1 }, () => {
        this.setDate()
      })
    }
  },
  acdate:function(e){
    var date = e.currentTarget.dataset.date
    if (this.datas[this.dkl + date]){
      this.setData({acdate:date, vc_count: this.datas[this.dkl + date].vcs.length, st_count: this.datas[this.dkl + date].sts.length })
    }else{
      this.setData({ acdate:date,vc_count: 0, st_count: 0 })
    }
    
  },learnvc:function(e){
      var acdk=this.dkl+this.data.acdate
      wx.navigateTo({
        url: '/pages/learn/word/word?dk='+acdk
      })
  },learnst: function (e) {
    var acdk = this.dkl + this.data.acdate
    wx.navigateTo({
      url: '/pages/learn/word?dk=' + acdk
    })
  }
})