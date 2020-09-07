
create table player (
	id serial primary key,
	name text unique not null
);

insert into player(name) values('player1');
insert into player(name) values('player2');

create table game (
	id serial primary key,
	player1 integer references player (id) not null,
	player2 integer references player (id) not null,
	winner integer references player (id)
);

create table shot (
	id serial primary key,
	game integer references game (id) not null,
	player integer references player (id) not null,
	board_row integer not null,
	board_column integer not null,
	result boolean not null
);
