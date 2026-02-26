import React from 'react';
import { createRoot } from 'react-dom/client';
import { db } from './example/DBClient'
import { Model, xt } from './src';

class UserModel extends Model {
  schema() {
    return {
      uid: xt.id(),
      name: xt.string(),
      age: xt.number(),
      email: xt.string().email().unique(),
      products: xt.many(ProductModel).target("user"),
      customer: xt.one(UserModel).target("customers"),
    }
  }
}

class ProductModel extends Model {
  schema() {
    return {
      pid: xt.id(),
      name: xt.string(),
      description: xt.string(),
      status: xt.string(),
      user: xt.one(UserModel).target("products")
    }
  }

  getStudents() {

  }
}

const User = db.model(UserModel)
const Product = db.model(ProductModel)
const cols = User
type T = typeof cols

const s = Product.schema().user.schema
// console.log(User.schema());

const f = User.find({
  distinct: ['age', "email"],
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
    name: true,
    email: true,
    products: {
      select: {
        name: true,
      },
      where: {
        pid: 3
      }
    },
  },
  where: [
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
          },
          {
            name: {
              not: {
                in: ["as", "bs"],
                not: {
                  contains: "as"
                }
              }
            }
          }
        ]
      }
    },
    {
      name: {
        not: {
          in: ["as", "bs"],
          not: {
            contains: "as"
          }
        }
      }
    }
  ]
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
