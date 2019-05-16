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
    this.at_id = atid
    this.setatinfo(atid)
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  at_id:null,
  setatinfo: function (atid) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this
    const db = wx.cloud.database()
    db.collection('articles')
      .where({
        _id: atid
      })
      .get()
      .then(res => {
        var en = res.data[0].at_en.split("\n")
        var cn = res.data[0].at_cn.split("\n")
        var name = res.data[0].at_name
        var info = []
        for(var i in en){
          var words = en[i].split(" ")
          if (words.length > 1 || words[0]!=""){
            info.push({en:words,cn:cn[i]})
          }
        }
        this.setData({ atinfo: { info: info, name: name, audio: res.data[0].at_ph}})
        wx.hideLoading()
      })
      .catch(console.error)

  }, 
  settype:function(e){
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
    var id=['cloud://izvoc-2881ea.697a-izvoc-2881ea/at_audio/' + that.at_id + '.mp3']
    wx.cloud.getTempFileURL({
      fileList:id,
      success: res => {
        iac.src = res.fileList[0].tempFileURL
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
      fail: err => {
        // handle error
        console.log(err)
      }
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
      url: 'https://www.iciba.com/index.php?a=getWordMean&c=search&word='+w,
      data: {},
      header: {
        'content-type': 'application/json', // 默认值
      },
      success: function (res) {
        // console.log(res.data.baesInfo.symbols[0])
        try {
          var info = res.data.baesInfo.symbols[0]
        }
        catch (err) {
          wx.hideLoading()
          wx.showToast({ title: "无相关记录", icon:'none'})
          return;
        }
        var word={
          info: info,
          type:'',
          vc_vocabulary:w
        }
        word.info.ph_en_mp3 = word.info.ph_en_mp3.replace("http:", "https:")
        word.info.ph_am_mp3 = word.info.ph_am_mp3.replace("http:", "https:")
        that.setData({  word: word}, () => {
          wx.hideLoading()
        })
      }
    })
  },
  iac2: wx.createInnerAudioContext(),
  word_video:function(e){
    src=e.currentTarget.dataset.src
    iac= wx.createInnerAudioContext()
  },
  openvideo: function (e) {
    console.log(e)
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
    iac.src = e.currentTarget.dataset.src
    iac.onCanplay(function () {
      iac.play()
    })
  }, binfh:function(e){
    var idx=e.detail.current
    this.setData({idx:idx})
  }
})