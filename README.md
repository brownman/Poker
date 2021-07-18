```yaml

STEPS:
  - Authentication:
      user supply:
        - username
        - password (optional)
            - server:
                - use bcrypt: 
  - code:
      - server:
          - socket.handshake.auth[sessionId or creds];
          - socket.sessionID = randomId();
          - socket.userID = randomId();""
      - client:
          - setup socket server and client
          - implement messages typ    socket.sessionID = randomId();
      - DB:
          - persistent: class RedisSessionStore extends SessionStore
          - jwt: avoid storing sessions id

    - message type:
        -  select X random users: implememt random selection on the server
    - scaling:
        - use a redis adapter for pub/sub each node 
    - testing:
        - test user connectivity when 
    
````
