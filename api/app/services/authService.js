// app/services/authService.js
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const path = require('path')
const bcrypt = require('bcrypt')

dotenv.config({
    path: path.join(__dirname, '../../.env')
})

// Nombre de "salts" pour le hashage (plus = plus sécurisé mais plus lent)
const SALT_ROUNDS = 10

const authService = {
    // Hash un mot de passe avec bcrypt
    async hashPassword(password) {
        return await bcrypt.hash(password, SALT_ROUNDS)
    },

    // Vérifie qu'un mot de passe correspond à un hash
    async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash)
    },

    // Génère un token JWT avec payload (ex: email)
    generateToken(payload) {
        const token = jwt.sign(payload, process.env.SECRET_KEY, { algorithm: 'HS256', expiresIn: '1h' })
        return token
    },

    // Décode un token JWT (renvoie {} si invalide)
    decodeToken(tokenToDecode) {
        try {
            const decoded = jwt.verify(tokenToDecode, process.env.SECRET_KEY)
            return decoded
        } catch (err) {
            return {}
        }
    }
}

module.exports = authService
