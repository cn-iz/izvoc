<?php
/**
 * Created by PhpStorm.
 * User: iz
 * Date: 2018/9/8
 * Time: 16:56
 */

namespace app\index\controller;


use app\dbs\mydb;
use app\dbs\updb;
use think\Controller;

class Sql extends Controller
{
    public function quary(){
        $sql=input('sql');
        $info=(new mydb())->quary($sql);
        return json($info);
    }
    public function getvc(){
        $in=input();
        $info=(new mydb())->getvoc_limit($in['start'],$in['len'],$in['bkid']);
        return json($info);
    }
    public function findvc_old(){
        $info=(new mydb())->quary("SELECT * from voc_tb where vc_vocabulary='".input()['w']."'");
        if($info){
            $info=$info[0];
            $info['vc_explain_baes']=json_decode($info['vc_explain_baes']);
            return json($info);
        }else{
            return '';
        }
    }
    public function baidu($word){
        try{
            $appid = '20180604000171655';
            $secretKey = 'qJ_e3_FvOrtjA6j4EJKk';
            $salt = rand(32768, 65536);
            $sign = md5($appid.$word.$salt.$secretKey);
            $url = 'https://api.fanyi.baidu.com/api/trans/vip/translate';
            $post_data['appid']       = $appid;
            $post_data['q']      = $word;
            $post_data['from'] = 'en';
            $post_data['to'] = 'zh';
            $post_data['salt']    = $salt;
            $post_data['sign']    = $sign;
            $o = "";
            foreach ( $post_data as $k => $v )
            {
                $o.= "$k=" . urlencode( $v ). "&" ;
            }
            $post_data = substr($o,0,-1);
            $res = file_get_contents($url.'?'.$o);
            $res=json_decode($res,true);
            if(!array_key_exists('trans_result',$res)){
                return false;
            }
            return $res['trans_result'][0];
        }catch (Exception $e){
            return false;
        }

    }
    public function jinshan($word){
        //   金山
        try{
            $url='http://www.iciba.com/index.php?a=getWordMean&c=search&list=1%2C2%2C3%2C4%2C5%2C8%2C9%2C10%2C12%2C13%2C14%2C18%2C21%2C22%2C3003%2C3005&word='.$word;
            $info= json_decode(file_get_contents($url),true);
            if(!array_key_exists("baesInfo",$info)){
                return false;
            }
            if(!array_key_exists("symbols",$info['baesInfo'])){
                return false;
            }
            $symbol=$info['baesInfo']['symbols'][0];
            $ms='';
            foreach ($symbol['parts'][0]['means'] as $m){
                if($ms==''){
                    $ms=$ms.$m;
                }else{
                    $ms=$ms.','.$m;
                }
            }
            $id=uniqid('k',true);
            $id=str_replace('.','',$id);
            $winfo=['vc_id'=>$id,'vc_vocabulary'=>$info['baesInfo']['word_name'],'vc_phonetic_uk'=>'['.$symbol['ph_en'].']','vc_phonetic_us'=>'['.$symbol['ph_am'].']','vc_difficulty'=>101,'vc_updated_time'=>'','vc_study_user_count'=>0,'vc_explain_baes'=>$symbol['parts'],'vc_ph_en'=>str_replace("http:/","",$symbol['ph_en_mp3']),'vc_ph_us'=>str_replace("http:/","",$symbol['ph_am_mp3']),'vc_explain_simple'=>$ms];
            (new updb())->addvc($winfo);
//            句子
            if(array_key_exists('jushi',$info)){
                foreach ($info['jushi'] as $js){
                    $js['mp3']=str_replace('http:/','',$js['mp3']);
                    $js['type']='jushi';
                    $js['vc_id']=$id;
                    (new updb())->addst($js);
                }
            }
            if(array_key_exists('sentence',$info)){
                foreach ($info['sentence'] as $st){
                    $js['english']=$st['Network_en'];
                    $js['chinese']=$st['Network_cn'];
                    $js['mp3']=str_replace('http:/','',$st['tts_mp3']);
                    $js['type']='sentence';
                    $js['vc_id']=$id;
                    (new updb())->addst($js);
                }
            }
            return $winfo;
        }catch (Exception $e){
            return false;
        }
    }
    public function findvc(){
        //     数据库查询
        $w=input()['w'];
        $w=str_replace("'","\'",$w);
        $info=(new mydb())->quary("SELECT * from voc_tb where vc_vocabulary='$w'");
        if($info){
            $info=$info[0];
            $info['vc_explain_baes']=json_decode($info['vc_explain_baes']);
            return json(['type'=>'db','info'=>$info]);
        }
        $res=$this->jinshan(input()['w']);
        if($res){
            return json(['type'=>'jinshan','info'=>$res]);
        }else{
            $res=$this->baidu(input()['w']);
            if($res){
                return json(['type'=>'baidu','info'=>$res]);
            }else{
               return json(['type'=>'err']);
            }
        }
    }
    public  function getvcsbyids()
    {
        $info = (new mydb())->getvcsbyids(input()['ids']);
        return json($info);
    }
    public function getmd5()
    {
        halt(md5('1000'));
    }
    public function getatinfobyid(){
        $info = (new mydb())->getatinfobyid(input()['atid']);
        $enrows=explode("\n",$info['at_en']);
        $cnrows=explode("\n",$info['at_cn']);
        $res=['id'=>$info['at_id'],'audio'=>$info['at_ph'],'name'=>$info['at_name'],'info'=>[]];
        for ($i=0;$i<count($enrows);$i++){
            if($enrows[$i]==''){
                continue;
            }
            $words=explode(' ',$enrows[$i]);
            if(count($cnrows)>1){
                $r=['en'=>$words,'cn'=>$cnrows[$i]];
            }else{
                $r=['en'=>$words,'cn'=>""];
            }
            array_push($res['info'],$r);
        }
        return json($res);
    }
    public  function getjs(){
        $url='http://www.iciba.com/index.php?a=getWordMean&c=search&list=1%2C2%2C3%2C4%2C5%2C8%2C9%2C10%2C12%2C13%2C14%2C18%2C21%2C22%2C3003%2C3005&word='.input()['w'];
        $info= json_decode(file_get_contents($url),true);
        halt($info);
    }
}