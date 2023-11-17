
CREATE TABLE users(
    user_id SERIAL PRIMARY KEY,
    user_login VARCHAR(50),
    user_password VARCHAR(50),
    user_email VARCHAR(255),
    user_color VARCHAR(50),
    user_rank VARCHAR(255)
);

CREATE TABLE usernumbers(
    user_number INTEGER UNIQUE,
    user_id INTEGER,
    number_points FLOAT,
    number_color VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(user_id) 
);

CREATE TABLE userblocks(
    block_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    block_date_start DATE,
    block_time_start TIME,
    block_total_time INTEGER,   
    block_reason VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id) on delete cascade
);