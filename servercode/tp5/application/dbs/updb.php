<?php
/**
 * Created by PhpStorm.
 * User: iz
 * Date: 2018/10/1
 * Time: 8:21
 */

namespace app\dbs;


use think\Db;

class updb
{
    public function addvc($vc){
        $vc['vc_explain_baes']=json_encode($vc['vc_explain_baes']);
        return Db::table('voc_tb')->insert($vc);
    }
    public function addst($st){
        return Db::table('st_tb')->insert($st);
    }
}