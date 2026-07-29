import * as React from 'react';
import Hello from './components/Hello';
import NameEditComponent from './components/NameEditComponent2';
const App:React.FC = () => {
  const [username, setUserName] = React.useState("initialName");
  // const setUsernameState = (event:React.ChangeEvent<HTMLInputElement>) => {
  //   setUserName(event.target.value)
  // }
  return (
    <div>
      {/* <Hello username={username}/>
      <NameEditComponent 
         username={username}
         onChange={setUsernameState}
      /> */}
      <NameEditComponent 
         initialUserName={username}
         onNameUpdated={setUserName}
      />
    </div>
  )
}

export default App