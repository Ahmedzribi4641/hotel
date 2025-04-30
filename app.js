const express= require('express')
const mongoose= require('mongoose')
const dotenv=require('dotenv')
const cors=require('cors')
const path = require('path'); 
dotenv.config()
const app=express()

app.use(express.json())
app.use(cors())


const PersonneRouter=require("./routes/personne.route")
const ServiceRouter=require("./routes/service.route")
const CategorieRouter=require('./routes/categorie.route')
const ChambreRouter=require('./routes/chambre.route')
const ReservationRouter=require('./routes/reservation.route')
const FactureRouter=require('./routes/facture.route')
const InformationRouter=require('./routes/information.route')
const HistoriqueRouter=require('./routes/historique.route')
const PaymentRouter=require("./routes/payment.route")
const MessageclientRouter=require("./routes/messageclient.route")
const MessageenvoyerRouter=require("./routes/messageenvoyer.route")
const AbonnerRouter=require("./routes/abonner.route")
const MessageenvoyerabonnerRouter=require("./routes/messageabonnerenvoyer.route")
const MontantannulerRouter=require("./routes/montantannuler.route")
const MotdepasseoublierRouter=require("./routes/motdepasseoublier.route")










// connexion a la base de donné
mongoose.connect(process.env.DATABASECLOUD)
.then(()=>{console.log("connexion a la base de donné reussie")})
.catch((error)=>{console.log("impossible de connecté a la base de donné",error)
    process.exit()
})







app.use("/api/personnes",PersonneRouter);
app.use("/api/services",ServiceRouter);
app.use("/api/categories",CategorieRouter);
app.use("/api/chambres",ChambreRouter);
app.use('/api/reservations',ReservationRouter)
app.use('/api/factures',FactureRouter)
app.use('/api/informations',InformationRouter)
app.use('/api/historiques',HistoriqueRouter)
app.use('/api/payment', PaymentRouter);
app.use('/api/messagesclients', MessageclientRouter);
app.use('/api/messageenvoyer', MessageenvoyerRouter); // les reponse de ladmin
app.use('/api/abonners', AbonnerRouter);
app.use('/api/messageenvoyerabonner', MessageenvoyerabonnerRouter); // les messages des offre par ladmin
app.use('/api/montantannuler', MontantannulerRouter); // les messages des offre par ladmin
app.use('/api/motdepasseoublier', MotdepasseoublierRouter);




//dist reactjs
app.use(express.static(path.join(__dirname, './client/build'))); // Route pourles pages non trouvées, redirige vers index.html
app.get('*', (req, res) => { res.sendFile(path.join(__dirname,'./client/build/index.html')); });



app.listen(process.env.PORT,()=>{
    console.log(`serveur is listen sur port ${process.env.PORT}`)
})


module.exports=app;