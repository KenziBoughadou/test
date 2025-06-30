const express = require('express')
const dotenv = require('dotenv')
const path = require('path')
const { generateToken, decodeToken, hashPassword, verifyPassword } = require('./app/services/authService')
dotenv.config({
    path: path.join(__dirname, '.env')
})

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ limit: '10mb' }))

// Base utilisateurs simple (en RAM, à remplacer par une vraie BDD en prod)
const users = {}

// Fonction pour vérifier la complexité d'un mot de passe (à améliorer selon besoins)
function isStrongPassword(password) {
    return (
        password.length >= 8 &&
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^a-zA-Z0-9]/.test(password)
    )
}

// Endpoint d'inscription
app.post('/api/v1/auth/register', async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' })
    if (users[email]) return res.status(400).json({ error: 'Utilisateur déjà inscrit.' })
    if (!isStrongPassword(password)) return res.status(400).json({ error: 'Mot de passe trop faible.' })

    const hash = await hashPassword(password)
    users[email] = { hash }
    res.status(201).json({ message: 'Inscription réussie !' })
})

// Endpoint de connexion
app.post('/api/v1/auth/login', async (req, res) => {
    const { email, password } = req.body
    const user = users[email]
    if (!user) return res.status(400).json({ error: 'Utilisateur non trouvé.' })

    const ok = await verifyPassword(password, user.hash)
    if (!ok) return res.status(401).json({ error: 'Mot de passe incorrect.' })

    const token = generateToken({ email })
    res.status(200).json({ token })
})

// Middleware d’authentification JWT
function requireAuth(req, res, next) {
    const authorization = req.headers.authorisation || req.headers.authorization
    if (!authorization) return res.status(401).json({ error: 'Token manquant.' })

    const token = authorization.split(' ')[1]
    const decoded = decodeToken(token)
    if (!decoded.email) return res.status(401).json({ error: 'Token invalide.' })
    req.user = decoded
    next()
}

// Endpoint protégé : suppression de l'utilisateur connecté
app.delete('/api/v1/users/delete', requireAuth, (req, res) => {
    const { email } = req.user
    if (users[email]) {
        delete users[email]
        return res.status(200).json({ message: `Utilisateur ${email} supprimé.` })
    } else {
        return res.status(404).json({ error: 'Utilisateur non trouvé.' })
    }
})

// Paramètres serveur
app.set('port', process.env.PORT)
app.set('host', process.env.HOST)
app.listen(app.get('port'), () => {
    console.log(`🚀Server running at ${app.get('host')}: ${app.get('port')}`)
})
