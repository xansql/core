import React from 'react';
import { createRoot } from 'react-dom/client';
import { db } from './example/DBClient'
import { Model, xt } from './src';
import { Product, User } from './example/db-client';

const Button = ({ label, onClick }: any) => {
  return (
    <button
      onClick={async () => {
        await onClick()
      }}
      style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
    >
      {label}
    </button>
  );
}

const App = () => {
  const [file, setFile] = React.useState<File | null>(null);
  return (
    <div style={{ fontFamily: 'monospace,math, sans-serif', textAlign: 'center', marginTop: '50px' }}>
      <input type="file" onChange={(e) => {
        const file = e.target.files ? e.target.files[0] : null;
        setFile(file);
      }} />
      <div style={{ marginTop: "50px" }}>
        <Button label="Find" onClick={async () => {
          const results = await User.find({
            where: {
              uid: 10
            }
          })
          console.log(results);

        }} />
        <Button label="Create" onClick={async () => {

        }} />
        <Button label="Delete" onClick={async () => {

        }} />
      </div>
    </div>
  );
}
const rootEle = document.getElementById('root')
if (rootEle) {
  const root = createRoot(rootEle);
  root.render(<App />);
}
