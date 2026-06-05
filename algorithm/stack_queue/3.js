// js 没有 class ，约定大写构造函数
function Greeting(name){
    console.log(this);
    this.name= name;
    console.log(this);
    
}
Greeting.prototype.say=function(){
    console.log(`我叫${this.name},很高兴认识你`);
}
Greeting.prototype.work=function(){
    console.log(`我叫${this.name},我在工作`);
}
const zzh =new Greeting('张三');
console.log(zzh.name);
zzh.say();
zzh.work();
console.log(new Greeting('张三'));
