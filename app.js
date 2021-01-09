// Carregando Módulos
  const express = require('express')
  const handlebars = require('express-handlebars')
  const bodyParser = require('body-parser')
  const app = express()
  const admin = require('./routes/admin')
  const path = require('path')
  const mongoose = require('mongoose')
  const session = require('express-session')
  const flash = require('connect-flash')// è tipo de sessao que só aparece uma vez
  require('./models/Postagem')
  const Postagem = mongoose.model('postagens')
  require('./models/Categoria')
  const Categoria = mongoose.model('categorias')
  const usuarios = require('./routes/usuario')
  const passport = require('passport')
  require('./config/auth')(passport)


// Configs
  // Sessão
    app.use(session({
      secret: 'dessavaca',
      resave: true,
      saveUninitialized: true
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())
  // Middleware
    app.use((req, res, next) => {
      res.locals.success_msg = req.flash("success_msg")// Variáaveis Globais
      res.locals.error_msg = req.flash("error_msg")// Variáaveis Globais
      res.locals.error = req.flash('error')
      res.locals.user = req.user || null

      
      next()
    })
  //Body Parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())
  //Handlebars
    app.engine('handlebars', handlebars({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')
  // Mongo
    mongoose.connect('mongodb://localhost/blogapp').then(()=> {
      console.log('Conectado ao mongo')
    }).catch((err)=>{
      console.log('Ocorreu um erro'+err)
    })
// Rotas
  app.get('/', (req, res) =>{
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
      
      res.render('index', {postagens: postagens})
      
    }).catch((err) => {
      req.flash('error_msg', 'Houve um erro interno')
      res.redirect('/404')
      
    })
    
  })

  app.get('/404', (req, res) => {
    res.send('Error')
  })

  app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
      if(postagem){
        res.render('postagem/index', {postagem: postagem})
      }else{
        req.flash('error_msg', 'Esta postgem não existe')
        res.redirect('/')
      }
    }).catch((err) => {
      req.flash('error_msg', 'Houve um erro interno')
      res.redirect('/')
    })
  })

  
  app.get('/categorias', (req, res) => {
    Categoria.find().lean().then((categorias) => {
      res.render('categoria/index', {categorias: categorias})
    }).catch((err) => {
      req.flash('error_msg', 'Houve um erro ao listar as categorias')
      res.redirect('/')
    })
  })

  app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
      if(categoria){
        Postagem.find({categoria: categoria._id}).lean().then((postagens) => {

          res.render("categoria/postagens", {postagens: postagens, categoria: categoria})
        }).catch((err) => {
          req.flash('error_msg', 'Houve um erro ao listar os posts')
          res.redirect('/')
        })
      }else{
        req.flash('error_msg', 'Não foi possível encontrar a categoria desejada')
      }
    }).catch((err) => {
      req.flash('error_msg', 'Houve um erro carregar a página dessa categoria')
      res.render('/')
    })
  })
// Public
  app.use(express.static(path.join(__dirname,"public")))
  app.use('/admin', admin)
  app.use('/usuarios', usuarios )

// Outros
const PORT = 3000
app.listen(PORT, () => {
  console.log('Servidor está rodando')
})