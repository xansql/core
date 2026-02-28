import dotenv from 'dotenv'
dotenv.config()
import fakeData from './faker'
import express, { Express } from 'express';
import { db } from './example/DBServer'
import WhereArgsQuery from './src/model/Args/WhereArgs';
import SelectArgs from './src/model/Executer/Find/SelectArgs';
import UpdateDataArgs from './src/model/Executer/Update/UpdateDataArgs';
import XansqlBridgeServer from '@xansql/bridge/server';

import { XansqlFileMeta, xt } from './src';
import fs from 'fs'
import path from 'path'
import { Infer } from 'xanv';
import { User } from './example/db';




const o = xt.array(xt.number())

type T = Infer<typeof o>


let dir = 'uploads';

const bridge = new XansqlBridgeServer(db as any, {
   basepath: "/data",
   mode: "development",
   file: {
      upload: async (chunk: Uint8Array, filemeta: XansqlFileMeta) => {
         const uploadDir = path.join(process.cwd(), dir);
         if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
         const filePath = path.join(uploadDir, filemeta.fileId);
         fs.appendFileSync(filePath, Buffer.from(chunk));
      },
      delete: async (fileId: string) => {
         const fs = await import('fs');
         const path = await import('path');
         const filePath = path.join(process.cwd(), dir, fileId);
         if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
         }
      }
   },
   isAuthorized: async (info) => {
      return true;
   }
})

const server = async (app: Express) => {
   app.use('/static', express.static('public'));
   app.use(express.json());
   app.use(express.urlencoded({ extended: true }));
   app.disable('etag');

   app.use('/data/*', express.raw({ type: bridge.REQUEST_CONTENT_TYPE, limit: "10mb" }), async (req: any, res: any) => {
      const response = await bridge.listen(req.originalUrl, {
         body: req.body,
         headers: req.headers
      })
      res.status(response.status).end(response.value);
   })


   // app.get('/foreign', async (req: any, res: any) => {
   //    const f = db.foreignInfo("posts", "user")
   //    const u = db.foreignInfo("users", "user_posts")

   //    res.json({
   //       f, u
   //    })
   // });


   app.get('/find', async (req: any, res: any) => {
      const start = Date.now()
      const results = await User.find({

      })
      res.json({})

   });

   app.get("/aggregate", async (req: any, res: any) => {
      const start = Date.now()

      res.json("result")
   })
   app.get("/count", async (req: any, res: any) => {

   })

   app.get('/create', async (req: any, res: any) => {

   });

   app.get('/delete', async (req: any, res: any) => {


   });


   app.get('/update', async (req: any, res: any) => {

   });

   app.get('/models', async (req: any, res: any) => {

   });

   app.get('/migrate', async (req: any, res: any) => {

   });

   app.get('/faker', async (req: any, res: any) => {
      // const d = await fakeData(100)
      // const start = Date.now()
      // const users = await UserModel.create({
      //    data: d,
      //    select: {
      //       username: true,
      //       metas: true,
      //       products: true,
      //    }
      // })

      // const end = Date.now()
      // console.log(`Created ${users?.length} users in ${end - start}ms`)
      // res.json(users)
   });

}
export default server;