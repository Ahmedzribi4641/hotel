const mongoose = require('mongoose')
const bcrypt=require('bcrypt')

const personneSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, unique: true, required: false}, // el required hna 7atitha false 5ater 3meltelha middleware itha el client bech yzido el admin bech yzido ma8ir mail donc el mail ywali yet3aba wa7do mil middleware w yo93od kol mara yincrementi 5ater el mail lezmo unique.  w kenk 3al client nwali n7othelo obligatoire y7ot el email fil formulaire mte3o ya33ni . behi wel faza hethi mte3 el middleware ken 3al client 5ater ken howa yejem ykoun ma3andouch email  
    role: { type: String, enum: ["client", "admin", "superadmin"], required: true },
    password: {type: String,required: false }, // required false 5ater les client eli bech yzidhom el admin zeyed bech ya3tihom password oka 7oto fil register fil formulaire fil front obligatoire wkwh
    copiepassword: {type: String,required: false },
    isActive: {type: Boolean,default: false,required: false},
    clientDetails: {                                                                                  //hetha objet fih 7ajet teb3in  ken lel les clients
        cin: { type: Number, unique: true, required: function() { return this.role === 'client'; } },              // ya3ni el fonction matraja3 true ken mayebda el role = client sinon false betbi3a
        tel: { type: Number/*, required: function() { return this.role === 'client'; }*/ },
        sex: { type: String, enum: ['Homme', 'Femme']/*, required: function() { return this.role === 'client'; }*/ },
        datedenaissance: { type: Date/*,required: function() { return this.role === 'client'; }*/ },
        age: { type: Number },
        avatar:{type: String},  // image avatar homme or femme
        ajouterparadmin: {type: Boolean,default: false,required: false}
    }
},
{
    timestamps: true, // ya3tini les dates dajout wel modification
}
);

let count = 1; // hethi bech no93do nzidou biha fil les email eli yet3amlo lel les clients eli ma3andhomch des email

personneSchema.pre('save',async function(next) { // el async 5ater el bcrypt bech ne5demha bil await

    if(this.isModified('password')){
    this.copiepassword=this.password      // ne5thou menno el copie 9bal manecriptiwah bech nest7a9ouha fil mot de passe oublier
    }

    
    // hethi lel client eli bech yetzedo ma8ir des email ya3ni eli yajoutihom el admin
    if (this.role === 'client' && !this.email) {
        
        const existclient = await mongoose.model('Personne').find({ email: { $regex: /^client\d+@exemple\.com$/ } }).select('email');  // .select(email) ya3ni te5o les objet w te5o ken el attribut email mte3hom ya3ni
        const numutiliser = existclient.map(client => parseInt(client.email.match(/\d+/)[0])); // lient.email.match(/\d+/)  ne5ou biha ken les chiffre ya3ni w na3mloulhom parseint bech ywaliw des entier 5ater ki ne5thouhom yebdew string      // [0] 3ala 5ater el match traja3 awel ra9m wala groupe mte3 ar9am m3a b3adhhom fi tableau fih el chiffre 3ala chakl chaine donc bech ne5thou el chaine heki w n7awlouha el int w nab3thouha lel table numeroutiliser donc ne5thouha bil indice 0 
        let num = 1;
        while (numutiliser.includes(num)) {num++;}   // ya3ni 3ala 9ad ma el numero mawjoud o93od zid 7ata lin ywali ma3ach mawjoud fil list numeroutiliser bech to5roj ml boucle
        this.email = `client${num}@exemple.com`;
    }

    if (this.role === 'client' && this.isModified('clientDetails.datedenaissance')) {   // fil middle ware fi 3oudh nesta3mlo el not na3mlo haka 5ir 5ater el not na3ml fiha return ena ma3neha mithel itha matbedelch na3ml return next()  .  w wa9tha t5arajni mil middleware keml w trasali mankamelch el 7ajet el ba9iya    (donc heka 3lech hna mana3mlouch kima 3melna fil formation 5ater les middle ware eli 3amelhom fil projet maya3mlouch 7aja bark ya3mlou barcha 7ajet fard wa9t)
        const today = new Date();
        const birthDate = new Date(this.clientDetails.datedenaissance);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        this.clientDetails.age = age;
    }

    if (this.isModified('clientDetails.sex')) { 
        if(this.clientDetails.sex === 'Homme'){
            this.clientDetails.avatar='https://res.cloudinary.com/diqc1swld/image/upload/v1741918042/avatra_homme_whzum3.jpg';
        }else if(this.clientDetails.sex === 'Femme'){
            this.clientDetails.avatar='https://res.cloudinary.com/diqc1swld/image/upload/v1741918042/avatr_femme_ujhm3u.jpg';
       }
    //    else{                        // hethi el else lezma st7a9itelha fil front bech ki mana3tihech el sex ywali ma7otech el taswira 7ata lin na3tih   // esma3 rahi zeyda tejem tna7iha 5ater ena fil front bech naffichi ken eli 3andhom el clientdetail w mademo 3ando el clientdetail raho 3ando el sex
    //     this.clientDetails.avatar='';
    //    }
}


    if(this.isModified('password')){
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password, salt)
    this.password = hashedPassword  // konna najmo el this.password ntal3ouha lfou9 direct wkhw ya3ni
    }
    next();
});


module.exports = mongoose.model('Personne', personneSchema);
