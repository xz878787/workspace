import Child from './Child';
import { ThemeContext } from '../ThemeContext';
import{
    useContext
}from 'react';


const Page=()=>{
    const theme=useContext(ThemeContext);
    console.log(theme);

    return (
        <>
       Page{theme}
        </>

    )
}
export default Page;
