# Auth testing playbook (Emergent Google Auth)
1. Create test user + session in Mongo (db from backend/.env DB_NAME):
```
mongosh --eval "use('test_database'); var uid='test-user-'+Date.now(); var tok='test_session_'+Date.now();
db.users.insertOne({user_id:uid,email:'test.user.'+Date.now()+'@example.com',name:'Test Parent',picture:'',created_at:new Date()});
db.user_sessions.insertOne({user_id:uid,session_token:tok,expires_at:new Date(Date.now()+7*864e5),created_at:new Date()}); print(tok)"
```
2. curl $URL/api/auth/me -H "Authorization: Bearer TOKEN"; GET/PUT /api/progress the same way.
3. Browser: add cookie session_token (domain = app host, path /, httpOnly, secure, sameSite None) then open /parents (hold the gate 3s).
4. Users have user_id (custom), all queries exclude _id.
