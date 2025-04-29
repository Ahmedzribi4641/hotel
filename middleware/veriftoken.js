const jwt=require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    
    const header = req.headers['authorization'];
    const token = header && header.split('Bearer ')[1];
    
    if (!token) return res.status(403).send({ success: false, message: 'No token provided' });
    
    jwt.verify(token, process.env.SECRET, (err, decoded) => {               // decoded ma3neha bech ydecodi el token w yraj3elna meno les donner eli sna3nehom bih ya3ni ml les donneé hekom ne5o les attribut eli 7achti bihom mithel kima el role 5ater bech nesta3mlo fil middleware mte3 el role eli tji ba3d hethi fil methode donc hethi traja3li el user w ta3ml next bech tal9a ba3dha fil methode eli fil route el middleware mte3 el role eli bech testa3ml heka el user bech te5o el role ya3ni user.role   //  w benesba lel secret heki ma3neha lel securité ya3ni bech ythabet bih el variable heka 5ater a7na deja fil san3an esta3melneh donc lezmo yal9ah howa bidou  //  donc fibeli malezmekch tbadlo jomla ba3d matesna3 el token 5ater ba3d ywali hna ki yji ythabet m3ah ywali yraja3lk erreur 5atro mayel9ahech howa bido eli tesna3 bih weli mawjoud taw taw fil variable SECRET
    
    if (err) return res.status(403).send({ success: false, message:'Invalid token' });
    req.user = {}         // ya3ni el bech ndecodiw el token w nesn3o meno user bech yraja3houlna bech nesta3mloh fil middleware eli ba3d ya3ni kima 9olna 9bal   // nejem betbi3a nsami personne kima n7eb ya3ni 3adi
    req.user.id = decoded.iduser
    req.user.role = decoded.role
    next()
    })
    }

module.exports = { verifyToken }