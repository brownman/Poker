const bcrypt = require('bcrypt');
import { Credentials } from "../types/types";

/* abstract */ class UserStore {
  findUser(id) { }
  saveUser(credentials: Credentials, cb: (err, data) => void) { }
  findAllUsers() { }
}

export class InMemoryUserStore extends UserStore {
  users: Map<any, any>;
  constructor() {
    super();
    this.users = new Map();
  }

  validate_credentials(username, password, cb) {
    const user = this.findUser(username);
    //check creds requirments for compare
    if (!user) return cb(new Error("username not exist"), null);
    if (!user.password || user.password === '') return cb(new Error("username has no password"), null);

    //compare
    return this.comparePassword(password, user.password, cb)
  }

  findUser(username: string) {
    const pass = this.users.get(username);
    if (pass) {
      return { username: username, password: pass };
    }
  }

  comparePassword(password_try, hashed_password, cb) {
    // var password_try = "djlfhjd(456";
    bcrypt.compare(password_try, hashed_password, function (err, result) {
      if (result) {
        return cb(null, "It matches!");
      }
      cb(new Error('incorrect password'), null)
      //console.log("Invalid password!");
    });
  }

  saveUser(credentials: Credentials, cb: (err, data) => void) {
    const { username, password } = credentials;
    if (this.findUser(username)) return cb('username already exists', null);
    ;

    try {
      //let { username, password } = userdata;
      const hashed_password = bcrypt.hashSync(password, 10);

      this.users.set(username, hashed_password);
      cb(null, this.findUser(username));
    } catch (e) {

      //console.log(e);
      cb(e, null);
    }
  }

  findAllUsers() {
    return [...this.users.values()];
  }
}

const USER_TTL = 24 * 60 * 60;
const mapUser = ([userID, username, connected]) =>
  userID ? { userID, username, connected: connected === 'true' } : undefined;

// class RedisUserStore extends UserStore {
//   constructor(redisClient) {
//     super();
//     this.redisClient = redisClient;
//   }

//   findUser(id) {
//     return this.redisClient
//       .hmget(`user:${id}`, 'userID', 'username', 'connected')
//       .then(mapUser);
//   }

//   saveUser(id, { userID, username, connected }) {
//     this.redisClient
//       .multi()
//       .hset(
//         `user:${id}`,
//         'userID',
//         userID,
//         'username',
//         username,
//         'connected',
//         connected,
//       )
//       .expire(`user:${id}`, USER_TTL)
//       .exec();
//   }

//   async findAllUsers() {
//     const keys = new Set();
//     let nextIndex = 0;
//     do {
//       const [nextIndexAsStr, results] = await this.redisClient.scan(
//         nextIndex,
//         'MATCH',
//         'user:*',
//         'COUNT',
//         '100',
//       );
//       nextIndex = parseInt(nextIndexAsStr, 10);
//       results.forEach((s) => keys.add(s));
//     } while (nextIndex !== 0);
//     const commands = [];
//     keys.forEach((key) => {
//       commands.push(['hmget', key, 'userID', 'username', 'connected']);
//     });
//     return this.redisClient
//       .multi(commands)
//       .exec()
//       .then((results) => {
//         return results
//           .map(([err, user]) => (err ? undefined : mapUser(user)))
//           .filter((v) => !!v);
//       });
//   }
// }
// module.exports = {
//   InMemoryUserStore,
//   //RedisUserStore,
// };
