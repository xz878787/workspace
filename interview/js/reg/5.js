let template = `我是{{name}},年龄{{age}},性别{{sex}}`;
let person={
    name:"张三",
    age:18,
    sex:"男"
}
function render(temple,data){
const reg=/\{\{(\w+)\}\}/g;
    if(reg.test(template)){
        const name =reg.exec(template)[1];
      template= template.replace(reg,data[name])
      return render(template,data);  
    }
}
console.log(render(template,person));