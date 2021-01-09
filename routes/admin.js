const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin')

router.get('/', eAdmin,  (req,res) => {
  res.render('admin/index')
})

router.get('/categorias', eAdmin, (req, res) => {
  Categoria.find().lean().sort({date: 'desc'}).then((categorias) => {
    res.render("admin/categorias", {categorias: categorias})
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro, tente novamente")
    res.redirect('/admin')
  })
  
})

router.get('/categorias/add', eAdmin, (req, res) => {
  res.render('admin/addcategorias')
})

router.post('/categorias/nova', eAdmin, (req, res) => {
  
  var erros = []

  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({texto: "Nome Inválido"})
  }

  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    erros.push({texto: "Slug Inválido"})
  }

  if(req.body.nome.length < 2 ){
    erros.push({texto: "Nome da Categoria muito pequeno "})
  }
  
  if(erros.length > 0) {
    res.render("admin/addcategorias", {erros: erros})
  }else{
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
    }
  
    new Categoria(novaCategoria).save().then(() => {
      req.flash("success_msg", "Categoria salva com sucesso")//Está salvando a msg dentro da variavel global
      res.redirect("/admin/categorias")
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao salvar categoria")
      res.redirect('/admin/categorias')
    })
  }
  
})

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
  Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
    res.render('admin/editcategorias', {categoria: categoria})
  }).catch((err) => {
    req.flash('error_msg', 'Categoria não encontrada')
    res.redirect('/admin/categorias')
  })
  
})

router.post('/categorias/edit', eAdmin, (req, res) => {
  
  Categoria.findOne({_id: req.body.id}).then((categoria) => {
    
    categoria.nome = req.body.nome
    categoria.slug = req.body.slug

    categoria.save().then(() => {
      req.flash('success_msg', 'Categoria editada com sucesso')
      res.redirect('/admin/categorias')
    }).catch((err) => {
      req.flash('error_msg', 'Houve um erro para editar a categoria')
      res.redirect('/admin/categorias')
    })
  }).catch((err) => {
    req.flash('error_msg', 'Ocorreu um erro')
    res.redirect('/admin/categorias')
  })
})

router.post('/categorias/deletar', eAdmin, (req, res) => {
  Categoria.deleteOne({_id: req.body.id}).then(() => {
    req.flash('success_msg', 'Categoria deletada com sucesso')
    res.redirect('/admin/categorias')
  }).catch((err) => {
    req.flash('error_msg', 'Ocorreu um erro')
    res.redirect('/admin/categorias')
  })
})

router.get('/postagens', eAdmin, (req, res) => {
  Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
    res.render('admin/postagens', {postagens: postagens})
  }).catch((err) => {
    req.flash('error_msg', 'Houve um erro ao listar as postagens')
    res.redirect('/admin')
  })
  
})

router.get('/postagens/add', eAdmin, (req, res) => {
  Categoria.find().lean().then((categorias) => {
    res.render('admin/addpostagens', {categorias: categorias})
  }).catch((err) => {
    req.flash('error_msg', 'Ocorreu um erro')
    res.redirect('/admin')
  })
})

router.post('/postagens/nova', eAdmin, (req, res) => {
  var erros = []

  if(req.body.categoria == "0" ) {
    erros.push({texto: 'Categoria inválida, registre uma categoria'})
  }

  if(erros.length > 0) {
    res.render('admin/addpostagens', {erros: erros})
  }else{
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categorias,
      slug: req.body.slug
    }
    new Postagem(novaPostagem).save().then(() => {  
      req.flash('success_msg', 'Postagem adicionada com sucesso')
      res.redirect('/admin/postagens')
    }).catch((err) => {
      req.flash('error_msg', 'Houve um erro para efetuar a postagem')
      res.redirect('/admin/postagens')
    })
  }
})

  router.get('/postagens/edit/:id', eAdmin, (req, res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
      Categoria.find().lean().then((categorias) => {
        res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
      }).catch((err) => {
        req.flash('error_msg', 'Houve ao listar as categorias')
        res.redirect('/admin/postagens')
      })
    }).catch((err) => {
      req.flash('error_msg', 'Ocorreu um erro ao carregar o formulário de edição')
      res.redirect('/admin/postagens')
    })
  })

  router.post('/postagens/edit', eAdmin, (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {

      postagem.titulo = req.body.titulo,
      postagem.slug = req.body.slug,
      postagem.descricao = req.body.descricao,
      postagem.conteudo = req.body.conteudo,
      postagem.categoria = req.body.categoria

      postagem.save().then(() => {
        req.flash("success_msg", "Postagem editada com sucesso")
        res.redirect('/admin/postagens')
      }).catch((err) => {
        console.log(err)
        req.flash('error_msg', 'Ocorreu um erro ao salvar a edição da postagem')
        res.redirect('/admin/postagens')
      })
    }).catch((err) => {
      req.flash('error_msg', 'Ocorreu um erro para salvar a postagem')
      res.redirect('/admin/postagens')
    })
  })

  //router.get('postagens/deletar/:id', (req, res) => {
  //  Postagem.deleteOne({_id: req.params.id}).then(() => {
    //  res.redirect('/sadmin/postagens')
    //}).catch((err) => {
      //req.flash('error_msg', 'Ocorreu um erro ao deletar postagem')
      //res.redirect('/admin/postagens')
    //})
  //})

  router.post('/postagens/deletar', eAdmin, (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(()=> {
      req.flash('success_msg', 'Post deletado com sucesso')
      res.redirect('/admin/postagens')
    }).catch((err) => {
      req.flash('error_msg', 'Não foi possível deletar o post')
      res.redirect('/admin/postagens')
    })
  })
module.exports = router