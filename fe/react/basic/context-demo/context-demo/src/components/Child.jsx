import { useTheme} from '../hooks/useTheme';

function Child(){
    const theme=useTheme();
    console.log(theme);

    return (
        <>
        Child
        <button className={theme}></button>
        </>
    )
}
export default Child;