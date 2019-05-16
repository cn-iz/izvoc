<?php
namespace app\index\controller;

use app\dbs\government_userinfo;
use think\Controller;

class Index extends Controller
{
    public function index()
    {
        $this->redirect('index/login/index');
        $data=(new government_userinfo())->getall();
        $info=[];
        $key=[];
        foreach ($data as $d){
            if($d['rank']==2){
                array_push($key,$d['city']);
            }
        }
        foreach ($key as $k){
            $val=[];
            foreach ($data as $d){
                if($d['rank']==1&&$d['city']==$k){
                    array_push($val,$d['county']);
                }
            }
            $info[$k]=$val;
        }
        return json($info);
    }
}
