const express = require('express');
const bodyParser = require('body-parser');
const  bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
  client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'armel',
      password : '',
      database : 'smartbrain'
    }
})

console.log(db.select('*').from('users'));



const app = express();

app.use(bodyParser.json());
app.use(cors());

const database = {

     users : [

    {
        id :'20162',
        name:'Armel',
        email:'armel@gmail.com',
        password:'20162',
        entries:0,
        joined:new Date()
    },
    {
        id :'20255',
        name:'Yves',
        email:'yves@gmail.com',
        password:'20255',
        entries:0,
        joined:new Date()
    },
    {
        id :'20164',
        name:'caro',
        email:'caro@gmail.com',
        password:'20164',
        entries:0,
        joined:new Date()
    }
]
}

app.get('/',(req,res)=>{
    res.json(database.users);
})

app.post('/signin', (req,res)=>{
  db.select('email','hash').from('login')
  .where('email','=',req.body.email)
  .then(data =>{
    const isvalid = bcrypt.compareSync(req.body.password, data[0].hash);
    if(isvalid){
       return  db.select('*').from('users')
        .where('email', '=', req.body.email)
        .then(user =>{
            res.json(user[0])
        })
        .catch(err => res.status(400).json('unable to get user'))

    }else{
        res.status('400').json('Wrong credentials')
    }
  })
    
})

app.post('/register', (req, res)=>{
const { email, name,password } = req.body;

const hash = bcrypt.hashSync(password);
db.transaction(trx =>{
    trx.insert({
        hash : hash,
        email:email
    })
    .into('login')
    .returning('email')
    .then(loginEmail =>{
        return trx('users')
        .returning('*')
        .insert({
            email: loginEmail,
            name: name,
            joined: new Date()
        })
        .then(user =>{
            res.json(user[0]);
        })
    })
    .then(trx.commit)
    .cath(trx.rollback)

})
.catch(err=>res.status(400).json('unable to register'))
})
app.get('/profile/:id', (req,res)=>{
     const {id} =req.params;
   db.select('*').from('users').where({id})
   .then(user =>{
    if (user.length){
        res.json(user[0])
    }else{
        res.status(400).json('User not found')   
     }
   })
   .catch(err=>res.status(400).json('error getting user'))
})

app.put('/image', (req, res)=>{
    const {id} = req.body;
    db('users').where('id', '=', id)
    .increment('entries',1)
    .returning('entries')
    .then(entries =>{
            res.json(entries[0])
        }
    )
    .catch(err=>res.status(400).json('unable to get count for entries'))
    })
    
    

    


app.listen(3000,()=>{
    console.log('app is running on port 3000');
})