CREATE TABLE users (
   user_id serial PRIMARY KEY,
   username VARCHAR ( 50 ) UNIQUE NOT NULL,
   password VARCHAR ( 100 ) NOT NULL,
   email VARCHAR ( 255 ) UNIQUE NOT NULL,
   created_on TIMESTAMP NOT NULL,
   last_login TIMESTAMP,
   external_id VARCHAR ( 50 ) UNIQUE NOT NULL
);

CREATE TABLE rooms (
   room_id serial PRIMARY KEY,
   name VARCHAR ( 50 ) UNIQUE NOT NULL,
   created_on TIMESTAMP NOT NULL,
   created_by INTEGER NOT NULL
);

CREATE TABLE messages (
   message_id serial PRIMARY KEY,
   emetteur_id int NOT NULL,
   recepteur_id int NOT NULL,
   contenu varchar(255) NOT NULL,
   created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

insert into users (username, password, email, created_on, external_id) values ('test', 'gcrjEewWyAuYskG3dd6gFTqsC6/SKRsbTZ+g1XHDO10=', 'test@univ-brest.fr', now(), 'ac7a25a9-bcc5-4fba-8a3d-d42acda26949');

insert into rooms (name, created_on, created_by) values ('General', now(), 4);
insert into rooms (name, created_on, created_by) values ('News', now(), 4);
insert into rooms (name, created_on, created_by) values ('Random', now(), 4);