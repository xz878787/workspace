//蜜雪冰城产品之一  冰淇淋
//  企业， 很多的产品， 每一种产品都实现了相同的接口(方法)，
//一个企业这么多产品， 开发这怎么记得住？ 还有那么多工厂呢？
// 工厂模式来搞， 你不需要了解工厂里面那么多的类的实现细节，
//只要直接调用工厂类， 就可以得到你需要的产品
class IceCream{
    constructor(){
        this.name='冰激凌'
        this.price=10
        this.ingredients=['冰','糖','水']
    }
    show(){
        console.log(`${this.name} ${this.price} ${this.ingredients}`)
    }
}
class LemonTea{
    constructor(){
        this.name='柠檬水'
        this.price=10
        this.ingredients=['柠檬','糖','水']
    }
    show(){
        console.log(`${this.name} ${this.price} ${this.ingredients}`)
    }
}
class MilkTea{
    constructor(){
        this.name='奶茶'
        this.price=10
        this.ingredients=['牛奶','糖','水']
    }
    show(){
        console.log(`${this.name} ${this.price} ${this.ingredients}`)
    }
}

// 工厂类
class MixueFactory{
    
    static create(type){
        switch(type){
            case 'ice':
                return new IceCream()
            case 'lemon':
                return new LemonTea()
            case 'milk':
                return new MilkTea()
            default:
                throw new Error('未知产品类型: ' + type)
        }
    }
}
//管理并返回冰淇凌这个类
const drink1=MixueFactory.create('ice');
drink1.show();
