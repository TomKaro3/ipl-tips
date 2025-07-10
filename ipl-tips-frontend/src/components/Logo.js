import logo from '../logo-transparent.png';

export default function Logo({ size = 200 }) {
  const style = {
    width: size,
    height: 'auto',
    display: 'block',
    margin: '0 auto',
  };
  return <img src={logo} alt="App logo" style={style} />;
}