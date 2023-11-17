var pool = require('../db').pool;

class UserController {

    async createUser(userInfo) {
        const res = await pool.query('insert into users values(default,$1,$2,$3,$4,$5); ', [userInfo.login, userInfo.password, userInfo.email, userInfo.color, userInfo.rank]);
        console.log(res);
    }

    async getUserByLogin(userInfo) {
        const res = await pool.query('select user_id,user_login,user_color,user_rank from users where user_login in($1); ', [userInfo]);
        console.log(res.rowCount);
        return res;
    }

    async getUsers(req, res) {

    }
    async getUserById(req, res) {

    }
    async changeUser(req, res) {

    }
    async deleteUser(req, res) {

    }
}

module.exports = { UserController }
