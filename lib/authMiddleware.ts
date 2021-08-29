
import { randomBytes } from "crypto";

export const authMiddleware = (io, userStore, sessionStore) => {
    const randomId = () => randomBytes(8).toString("hex");
    io.use(async (socket, next) => {
        const sessionID = socket.handshake.auth.sessionID;
        if (sessionID) {
            const session = await sessionStore.findSession(sessionID);
            if (session) {
                socket.sessionID = sessionID;

                //how these are stored ?
                socket.userID = session.userID;
                socket.username = session.username;
                return next();
            }
        }
        const username: string = socket.handshake.auth.username;
        const password: string = socket.handshake.auth.password;

        if (!username || !password) {
            return next(new Error("empty username or password"));
        }

        userStore.validate_credentials(username, password, (err, data) => {
            if (err) {
                return next(err)
            }
            socket.sessionID = randomId();
            socket.userID = randomId();
            socket.username = username;
            next();
        });

    });



}

