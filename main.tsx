import React from 'react';
import { createRoot } from 'react-dom/client';
import { db } from './example/DBClient'
import { Model, xt } from './src';
import { Product, User } from './example/db';

const cols = User
type T = typeof cols

const s = Product.schema().user.schema
// console.log(User.schema());

const f = User.find({
  groupBy: ['age', "email"],
  orderBy: {
    name: "desc",
    customer: "asc",
    uid: "asc"
  },
  aggregate: {
    products: {
      name: {
        count: {
          round: 2
        }
      }
    }
  },
  select: {
    // name: true,
    // email: true,
    customer: true,
    products: {
      select: {
        name: true,
        // user: true
      },
      where: {
        pid: 3
      }
    },
  },
  where: [
    {

      customer: {
        uid: {
          in: [1]
        }
      },
      name: {
        is: "asd"
      },
      email: [
        {
          contains: "a",
        },
        {
          contains: "b",
        }
      ],
      products: {
        status: "",
        description: "",
        user: [
          {
            name: "nax",
            email: "toast@sad.com",
          },
          {
            name: "well"
          }
        ]
      }
    },
    {
      name: {
        is: "asd"
      },
      email: [
        {
          contains: "a",
        },
        {
          contains: "b",
        }
      ],
      products: {
        status: "",
        description: "",
        user: [
          {
            name: "nax",
            email: "toast@sad.com",
            products: {
              user: {
                name: {
                  not: {
                    endsWith: "Test"
                  }
                }
              },
              name: {
                not: {
                  contains: "P"
                }
              }
            }
          },
          {
            name: {
              not: {
                in: ['a']
              }
            }
          }
        ]
      }
    },
  ]
})

const create = User.create({
  data: {
    name: ""
  }
})


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
  return ""
  return (
    <div style={{ fontFamily: 'monospace,math, sans-serif', textAlign: 'center', marginTop: '50px' }}>
      <input type="file" onChange={(e) => {
        const file = e.target.files ? e.target.files[0] : null;
        setFile(file);
      }} />
      <div style={{ marginTop: "50px" }}>
        <Button label="Find" onClick={async () => {

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
