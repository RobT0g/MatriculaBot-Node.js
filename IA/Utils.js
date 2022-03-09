import {chat} from './ChatFlow.js'
import {ChatManager} from './ChatManager.js'
import {database} from './DataKeeper.js'

//--------TODO--------//
/**
 *  
 */ 

class Message{              //Guarda utilidades da mensagem recebida
    constructor(str, type){
        this.msgbody = str
        this.filterMsg = str.replace('ç', 'c').normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        this.wrds = this.cleanText(str)
        this.type = type
        this.positive = (['sim', 'ok', 'certo', 'beleza', 'concordo'].some((x) => this.wrds.includes(x)) || 
             this.wrds.includes('tudo') && this.wrds.includes('bem')) &&
             !this.wrds.includes('nao')
        this.negative = (['nao', 'discordo', 'errado'].some((x) => this.wrds.includes(x))) &&
            !this.wrds.includes('sim')
    }

    cleanText(str){
        let txt = str.replace('ç', 'c')
        return txt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z]/g, ' ').split(' ').reduce((acc, i)=>{(!i=='')?acc.push(i):null; return acc},[])
    }
}

class DataBase{                 //Guarda todos os usuários
    constructor(){
        this.users = {}
    }

    getWelcome(){
        return chat.getWelcome()
    }

    userRegister = async function(num){
        if(num in this.users) 
            return 0
        let user = await database.getUserRegister(num)
        if(user){
            this.users[num] = new User(num)
            await this.users[num].chat.goTo(user.talkat)
            return 1
        }
        this.users[num] = new User(num)
        await database.addUser(num)
        return 2
    }

    newMessage = async function(msg, type, num){
        let message = new Message(msg, type)
        return await this.users[num].chat.newMessage(message, num)
    }
}

class User{     //Guarda atributos sobre o usuário
    constructor(num){
        this.num = num
        this.chat = new ChatManager(num)
    }
}


export { Message, DataBase, User }