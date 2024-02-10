const express = require('express')
const router = express.Router()
const multer = require('multer');
const path = require('path');
const User = require('../models/user.model')
const {requireAuth} = require('../middlewares/auth.middleware');
const Post = require('../models/post.model');
const { title } = require('process');


// Set storage engine
const storage = multer.diskStorage({
    destination: 'statics/user_files/',
    filename: function(req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
  
  // Initialize multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1 MB limit
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}); // 'image' is the name attribute of your file input field
  
  // Check file type
function checkFileType(file, cb) {
// Allowed extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Check the extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check the MIME type
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images only!');
    }
}

router.get('/profile', requireAuth, async (req, res) => {

    const user = await User.findOne({
        where: {
            email: res.locals.decoded.email
        }
    })

    if (user) {
        res.render('profile', {user })
    } else {
        res.redirect('auth/login')
    }
});

router.post('/profile', requireAuth, async (req, res) => {
    const { current_password, new_password, confirm_new_password } = req.body      

    if (Object.keys(req.body).length == 0 ) {
        upload.single('profile_image')(req, res, async (err) => {
            if (err) {
                res.status(400).json({ error: err });
            } else {
                if (req.file == undefined) {
                    res.status(400).json({ error: 'No file selected!' });
                } else {
                    const static_path = path.join(`/user_files`, req.file.filename);
                    await User.update(
                        {
                            profile_image: static_path
                        },
                        {
                            where: {
                                email: res.locals.decoded.email
                            }
                        }
                    );
                    res.redirect('/user/profile')
                }
            }
        });
    } if (current_password && new_password && confirm_new_password) {
        const user = await User.findOne({
            where: {
                email : res.locals.decoded.email
            }
        })
        if (current_password == user.password){
            if(new_password === confirm_new_password){
                await User.update(
                    {
                        password: new_password
                    },
                    {
                        where: {
                            email: res.locals.decoded.email
                        }
                    }
                )
                res.redirect('/user/logout')
            } else {
                res.redirect('/user/profile')
            }
        } else {
            res.redirect('/user/profile')
        }
    } else {        
        try {
            await User.update(
                req.body,
                {
                    where: {
                        email: res.locals.decoded.email
                    }
                }
            )
            res.redirect('/user/profile')
        } catch(e) {
            console.log(e)
            res.status(500).send({error: true, message: 'There was a problem to update the user!'})
        }
    }
})

// Route for logout
router.get('/logout', requireAuth, (req, res) => {

    res.clearCookie('token'); 
    
    res.redirect('/auth/login'); 
});

router.get('/posts/create', requireAuth, (req, res) => {
    res.render('create_post')
})

router.post('/posts/create', requireAuth, upload.single('cover'), async (req, res) => {
    const { title, content } = req.body

    const user = await User.findOne({
        where: {
            email: res.locals.decoded.email
        }
    })

    await Post.create({
        userId: user.id,
        title,
        content,
        cover: req.file.filename
    })

    res.redirect('/user/profile')
})

router.get('/posts', requireAuth, async (req, res) => {
    const user = await User.findOne({
        where: {
            email: res.locals.decoded.email
        }
    })

    const posts = await Post.findAll({
        where: {
            UserId: user.id,
        }
    })
    
    res.send(posts)
})


router.get('/posts/:id', requireAuth, async (req, res) => {
    const { id } = req.params

    const post = await Post.findOne( {
        where: {
            id
        }
    })

    res.render('update_post', { post })

})

router.post('/posts/:id', requireAuth, upload.single('cover'), async (req, res) => {
    const { id } = req.params
    const { title, content } = req.body
    await Post.update(
        {
            title, content,
            cover: req.file.filename
        },
        {
            where: {
                id
            }
        }
    )

    res.redirect("/user/profile")
})

router.delete("/posts/:id", requireAuth, async (req, res) => {
    const { id } = req.params
    await Post.destroy({
        where:{
            id
        }
    })
    res.send({ "message": "Post has been deleted successfully!" })
})


module.exports = router

