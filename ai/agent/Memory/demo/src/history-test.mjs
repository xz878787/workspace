import 'dotenv/config'
import { ChatOpenAI } from '@langchain/openai';
import{
    InMemoryChatMessageHistory  
} from '@langchain/core/chat_history';
import{
    HumanMessage,SystemMessage
} from '@langchain/core/messages';

const model=new ChatOpenAI({
    configuration:{
        
    }
})
