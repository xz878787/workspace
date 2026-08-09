import{
    ControlledInput,
    UncontrolledInput,
    CommentBox,
    RegisterForm,
    LoginForm,
} from './components';
function App() {
  return (
    <div>
      <ControlledInput />
      <UncontrolledInput />  
      <CommentBox />
      <RegisterForm />
      <LoginForm />
    </div>
  );
}
export default App;
