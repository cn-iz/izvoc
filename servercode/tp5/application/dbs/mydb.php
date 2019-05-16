<?php
/**
 * Created by PhpStorm.
 * User: iz
 * Date: 2018/9/8
 * Time: 17:08
 */

namespace app\dbs;


use think\Db;

class mydb
{
    public function quary($sql){
       return Db::query($sql);
    }
    public function getvoc_limit($start,$len,$bkid){
        $info= Db::query("SELECT vc_id,vc_vocabulary,vc_phonetic_uk,vc_phonetic_us,vc_difficulty,vc_explain_baes,vc_ph_en,vc_ph_us,vc_explain_simple,bv_order FROM bk_voc_tb b INNER  JOIN voc_tb v on b.bv_voc_id=v.vc_id where b.bv_book_id='$bkid' ORDER BY bv_order limit $start,$len;");
        $arr=[];
        for ($i=0;$i<count($info);$i++){
            $info[$i]['vc_explain_baes']=json_decode($info[$i]['vc_explain_baes']);
            $info[$i]['isac']=false;
            array_push($arr,$info[$i]['vc_id']);
        }
        $st=Db::table('st_tb')->whereIn('vc_id',$arr)->select();
        $s=[];
        foreach ($st as $r){
            $r['english']=explode(' ',$r['english']);
            if(array_key_exists($r['vc_id'],$s)){
                array_push($s[$r['vc_id']],$r);
            }else{
                $s[$r['vc_id']]=[];
                array_push($s[$r['vc_id']],$r);
            }
        }
        foreach ($info as  $vc){
            $enwords=explode(' ',$vc['vc_vocabulary']);
            for ($i=0;$i<count($enwords);$i++){
                $enwords[$i]=strtolower($enwords[$i]);
            }
            if(!array_key_exists($vc['vc_id'],$s)){
                continue;
            }
            for ($i=0;$i<count($s[$vc['vc_id']]);$i++){
                $arr=[];
                foreach($s[$vc['vc_id']][$i]['english'] as  $en){
                    if(in_array(preg_replace('/\W/','',strtolower($en)), $enwords)){
                        array_push($arr,['word'=>$en,'isvc'=>true]);
                    }else{
                        array_push($arr,['word'=>$en,'isvc'=>false]);
                    }
                }
                $s[$vc['vc_id']][$i]['english']=$arr;
                $s[$vc['vc_id']][$i]['isac']=false;
            }
        }

        return ['vc'=>$info,'st'=>$s];
    }
    public function getvcsbyids($ids){
        $info= Db::table('voc_tb')->whereIn('vc_id',$ids)->column(["vc_id","vc_vocabulary","vc_phonetic_uk","vc_phonetic_us","vc_difficulty","vc_explain_baes","vc_ph_en","vc_ph_us","vc_explain_simple"]);
        $arr=[];
        foreach (array_keys($info) as  $i){
            $info[$i]['vc_explain_baes']=json_decode($info[$i]['vc_explain_baes']);
            $info[$i]['isac']=false;
            array_push($arr,$info[$i]['vc_id']);
        }
        $st=Db::table('st_tb')->whereIn('vc_id',$arr)->select();
        $s=[];
        foreach ($st as $r){
            $r['english']=explode(' ',$r['english']);
            if(array_key_exists($r['vc_id'],$s)){
                array_push($s[$r['vc_id']],$r);
            }else{
                $s[$r['vc_id']]=[];
                array_push($s[$r['vc_id']],$r);
            }
        }
        foreach ($info as  $vc){
            $enwords=explode(' ',$vc['vc_vocabulary']);
            for ($i=0;$i<count($enwords);$i++){
                $enwords[$i]=strtolower($enwords[$i]);
            }
            for ($i=0;$i<count($s[$vc['vc_id']]);$i++){
                $arr=[];
                foreach($s[$vc['vc_id']][$i]['english'] as  $en){
                    if(in_array(preg_replace('/\W/','',strtolower($en)), $enwords)){
                        array_push($arr,['word'=>$en,'isvc'=>true]);
                    }else{
                        array_push($arr,['word'=>$en,'isvc'=>false]);
                    }
                }
                $s[$vc['vc_id']][$i]['english']=$arr;
                $s[$vc['vc_id']][$i]['isac']=false;
            }
        }

        return ['vc'=>$info,'st'=>$s];
    }

    public function  getstsbyids($ids){
        $info=Db::table('voc_tb')->alias('v')->join('st_tb')->whereIn($ids)->column();
    }

    public function  getatinfobyid($id){
        return Db::table('at_tb')->where('at_id',$id)->find();
    }
}