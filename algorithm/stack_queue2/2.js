//push pop 栈顶元素 peek stack[length-1]

const stack = [];//空栈
stack.push("东北大版");
stack.push("可爱多");
stack.push("冰工厂");
stack.push("巧乐兹");

// 出栈的代码
while(stack.length){
    const top=stack[stack.length-1];
    console.log(`取出来的是`,top);
    stack.pop();
}
console.log(stack);
